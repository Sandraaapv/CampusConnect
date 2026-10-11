package com.campusconnect.service;

import com.campusconnect.dto.*;
import com.campusconnect.model.*;
import com.campusconnect.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);
    private static final SecureRandom RANDOM = new SecureRandom();

    private final UserRepository userRepository;
    private final StudentRecordRepository studentRecordRepository;
    private final OtpCodeRepository otpCodeRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordHistoryRepository passwordHistoryRepository;
    private final LoginEventRepository loginEventRepository;
    private final CaptchaService captchaService;
    private final JwtService jwtService;
    private final PasswordPolicyService passwordPolicyService;
    private final EmailService emailService;
    private final RateLimiterService rateLimiterService;
    private final PasswordEncoder passwordEncoder;

    private final String collegeEmailDomain;
    private final String loginIdSuffix;
    private final int maxLoginAttempts;
    private final int lockoutMinutes;
    private final int otpExpirationMinutes;
    private final int refreshTokenDays;
    private final int rememberMeDays;

    private final String dummyPasswordHash;

    // Transient registration session store for Step 2 -> Step 3 transition (15 min validity)
    public record VerifiedRegistrationSession(String registerNumber, long expiresAt) {}
    private final Map<String, VerifiedRegistrationSession> registrationSessions = new ConcurrentHashMap<>();

    public AuthService(
            UserRepository userRepository,
            StudentRecordRepository studentRecordRepository,
            OtpCodeRepository otpCodeRepository,
            RefreshTokenRepository refreshTokenRepository,
            PasswordHistoryRepository passwordHistoryRepository,
            LoginEventRepository loginEventRepository,
            CaptchaService captchaService,
            JwtService jwtService,
            PasswordPolicyService passwordPolicyService,
            EmailService emailService,
            RateLimiterService rateLimiterService,
            PasswordEncoder passwordEncoder,
            @Value("${campusconnect.college-email-domain:campus.test}") String collegeEmailDomain,
            @Value("${campusconnect.login-id-suffix:}") String loginIdSuffix,
            @Value("${campusconnect.security.max-login-attempts:5}") int maxLoginAttempts,
            @Value("${campusconnect.security.lockout-duration-minutes:15}") int lockoutMinutes,
            @Value("${campusconnect.security.otp-expiration-minutes:10}") int otpExpirationMinutes,
            @Value("${campusconnect.jwt.refresh-token-expiration-days:7}") int refreshTokenDays,
            @Value("${campusconnect.jwt.remember-me-refresh-token-days:30}") int rememberMeDays) {
        this.userRepository = userRepository;
        this.studentRecordRepository = studentRecordRepository;
        this.otpCodeRepository = otpCodeRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.passwordHistoryRepository = passwordHistoryRepository;
        this.loginEventRepository = loginEventRepository;
        this.captchaService = captchaService;
        this.jwtService = jwtService;
        this.passwordPolicyService = passwordPolicyService;
        this.emailService = emailService;
        this.rateLimiterService = rateLimiterService;
        this.passwordEncoder = passwordEncoder;
        this.collegeEmailDomain = collegeEmailDomain.startsWith("@") ? collegeEmailDomain.substring(1) : collegeEmailDomain;
        this.loginIdSuffix = loginIdSuffix != null ? loginIdSuffix.trim() : "";
        this.maxLoginAttempts = maxLoginAttempts;
        this.lockoutMinutes = lockoutMinutes;
        this.otpExpirationMinutes = otpExpirationMinutes;
        this.refreshTokenDays = refreshTokenDays;
        this.rememberMeDays = rememberMeDays;

        // Dummy hash for constant-time comparison when user does not exist
        this.dummyPasswordHash = passwordEncoder.encode("dummy-nonexistent-password-hash");
    }

    public String getCollegeEmailDomain() {
        return collegeEmailDomain;
    }

    public String getLoginIdSuffix() {
        return loginIdSuffix;
    }

    // ====================================================================
    // 1. LOGIN (Captcha strictly on /login only)
    // ====================================================================
    @Transactional
    public LoginResult login(LoginRequest request, String ip, String userAgent) {
        String cleanIdentifier = normalizeIdentifier(request.identifier());
        if (cleanIdentifier == null || cleanIdentifier.isBlank()) {
            throw new IllegalArgumentException("Register number or college ID is required.");
        }

        // Validate Captcha (MANDATORY on login)
        if (!request.isDemo()) {
            if (request.captchaId() == null || request.captchaAnswer() == null ||
                    !captchaService.validateCaptcha(request.captchaId(), request.captchaAnswer())) {
                throw new InvalidCaptchaException("Incorrect captcha answer. Please try again with the new image.");
            }
        }

        Optional<User> userOpt = userRepository.findByIdentifier(cleanIdentifier);

        // Constant-time check regardless of user existence
        boolean userExists = userOpt.isPresent();
        User user = userOpt.orElse(null);

        if (user != null && user.isLocked()) {
            long remainingSeconds = Duration.between(LocalDateTime.now(), user.getLockedUntil()).getSeconds();
            if (remainingSeconds > 0) {
                long minutes = (remainingSeconds / 60) + 1;
                throw new AccountLockedException("Account is temporarily locked due to 5 failed attempts. Please try again in " + minutes + " minutes.", remainingSeconds);
            } else {
                user.setLockedUntil(null);
                user.setFailedAttempts(0);
                userRepository.save(user);
            }
        }

        String targetHash = (user != null) ? user.getPasswordHash() : dummyPasswordHash;
        boolean passwordMatches = passwordEncoder.matches(request.password(), targetHash);

        if (!userExists || !passwordMatches) {
            if (user != null) {
                int attempts = user.getFailedAttempts() + 1;
                user.setFailedAttempts(attempts);
                if (attempts >= maxLoginAttempts) {
                    user.setLockedUntil(LocalDateTime.now().plusMinutes(lockoutMinutes));
                    log.warn("Account locked for user: {} for {} minutes", maskId(user.getId()), lockoutMinutes);
                }
                userRepository.save(user);
                loginEventRepository.save(new LoginEvent(user.getId(), ip, userAgent, false, "Invalid password"));
            } else {
                loginEventRepository.save(new LoginEvent(null, ip, userAgent, false, "Unknown account: " + cleanIdentifier));
            }
            throw new InvalidCredentialsException("ID or password is incorrect.");
        }

        // Reset failed attempts upon successful login
        user.setFailedAttempts(0);
        user.setLockedUntil(null);
        userRepository.save(user);

        loginEventRepository.save(new LoginEvent(user.getId(), ip, userAgent, true, "Successful login"));

        if (!user.isEmailVerified()) {
            return new LoginResult(null, null, user, false, "Email not verified. Please verify your college email.");
        }

        int days = request.keepSignedIn() ? rememberMeDays : refreshTokenDays;
        String rawRefreshToken = createRefreshToken(user.getId(), UUID.randomUUID().toString(), userAgent, days, ip);
        String accessToken = jwtService.generateAccessToken(user);

        emailService.sendNewLoginAlert(user.getEmail(), user.getStudentRecord().getName(), userAgent, ip);

        return new LoginResult(accessToken, rawRefreshToken, user, true, "Login successful.");
    }

    // ====================================================================
    // 2. NEW 3-STEP REGISTRATION FLOW (/register)
    // ====================================================================

    /**
     * Step 1: Find your record
     * Input: Register number (trimmed and uppercase)
     * Looks up student_records. Sends 6-digit code to email on record.
     * Response is ALWAYS constant: "If this register number is eligible, we sent a code to the college email on record."
     * Shows masked address ONLY when code was really sent; otherwise shows neutral line.
     * Does NOT reveal if account already exists at Step 1 (handled after verification at Step 2).
     */
    @Transactional
    public RegisterSendCodeResult sendRegistrationCode(RegisterSendCodeRequest request, String ip, String userAgent) {
        String cleanRegNo = (request.registerNumber() != null) ? request.registerNumber().trim().toUpperCase() : "";
        if (cleanRegNo.isBlank()) {
            throw new IllegalArgumentException("Register number is required.");
        }

        // Abuse protection: Rate limiting per IP and per register number
        if (!rateLimiterService.isRegistrationCodeRequestAllowed(ip, cleanRegNo)) {
            throw new RateLimitExceededException("Too many requests, try again later.");
        }

        long startTime = System.currentTimeMillis();
        Optional<StudentRecord> recordOpt = studentRecordRepository.findByRegisterNumberIgnoreCase(cleanRegNo);

        String maskedEmail = null;

        if (recordOpt.isPresent()) {
            StudentRecord record = recordOpt.get();

            // Check daily email cap for this email address
            if (rateLimiterService.isDailyEmailCapAllowed(record.getEmail())) {
                String otp = generateOtpCode();
                saveOtpCode(cleanRegNo, "REGISTRATION_FLOW", otp);

                emailService.sendVerificationOtp(record.getEmail(), record.getName(), otp);
                maskedEmail = EmailService.maskEmail(record.getEmail());
            } else {
                log.warn("Blocked registration code dispatch due to daily cap for record {}", cleanRegNo);
            }
        }

        // Enforce constant response timing (~200ms) to prevent timing-based side-channel enumeration
        long elapsed = System.currentTimeMillis() - startTime;
        if (elapsed < 200) {
            try {
                Thread.sleep(200 - elapsed);
            } catch (InterruptedException ignored) {}
        }

        return new RegisterSendCodeResult(
                "If this register number is eligible, we sent a code to the college email on record.",
                maskedEmail
        );
    }

    /**
     * Step 2: Verify 6-digit code
     * Checks OTP (10m expiry, 5 attempts, single use, hashed).
     * After correct code:
     * - If account already exists: "An account already exists. Sign in instead."
     * - If eligible: returns read-only student details (name, department, semester) & temporary session token.
     */
    @Transactional
    public RegisterVerifyCodeResult verifyRegistrationCode(RegisterVerifyCodeRequest request, String ip) {
        String cleanRegNo = (request.registerNumber() != null) ? request.registerNumber().trim().toUpperCase() : "";
        String inputCode = (request.code() != null) ? request.code().trim() : "";

        if (cleanRegNo.isBlank() || inputCode.length() != 6) {
            throw new IllegalArgumentException("Valid register number and 6-digit code are required.");
        }

        OtpCode otpCode = otpCodeRepository
                .findTopByUserIdAndPurposeAndUsedFalseOrderByCreatedAtDesc(cleanRegNo, "REGISTRATION_FLOW")
                .orElseThrow(() -> new InvalidOtpException("Verification code has expired or is invalid. Please request a new code."));

        if (otpCode.isExpired()) {
            otpCode.setUsed(true);
            otpCodeRepository.save(otpCode);
            throw new InvalidOtpException("Verification code has expired. Please request a new code.");
        }

        otpCode.setAttempts(otpCode.getAttempts() + 1);
        if (otpCode.getAttempts() > 5) {
            otpCode.setUsed(true);
            otpCodeRepository.save(otpCode);
            throw new InvalidOtpException("Maximum verification attempts exceeded. Please request a new code.");
        }

        String inputHash = hashOtp(inputCode);
        boolean matches = MessageDigest.isEqual(
                otpCode.getCodeHash().getBytes(StandardCharsets.UTF_8),
                inputHash.getBytes(StandardCharsets.UTF_8)
        );

        if (!matches) {
            otpCodeRepository.save(otpCode);
            int remaining = Math.max(0, 5 - otpCode.getAttempts());
            throw new InvalidOtpException("Incorrect verification code. " + remaining + " attempts remaining.");
        }

        // Mark OTP consumed
        otpCode.setUsed(true);
        otpCodeRepository.save(otpCode);

        // Check if student account ALREADY EXISTS (handled here at Step 2 to avoid account enumeration at Step 1)
        if (userRepository.existsByRegisterNumberIgnoreCase(cleanRegNo)) {
            throw new UserAlreadyExistsException("An account already exists. Sign in instead.");
        }

        StudentRecord record = studentRecordRepository.findByRegisterNumberIgnoreCase(cleanRegNo)
                .orElseThrow(() -> new StudentRecordMismatchException("We couldn't find your college record. Contact your college office."));

        // Generate verified registration session token (15 minutes validity)
        String registrationToken = "reg-tok-" + UUID.randomUUID().toString();
        registrationSessions.put(registrationToken, new VerifiedRegistrationSession(cleanRegNo, System.currentTimeMillis() + 15 * 60 * 1000));

        StudentDetailsDto studentDto = new StudentDetailsDto(
                record.getRegisterNumber(),
                record.getName(),
                record.getDepartment(),
                record.getSemester()
        );

        return new RegisterVerifyCodeResult(true, registrationToken, studentDto);
    }

    /**
     * Step 3: Create password & complete registration
     * Input: registrationToken, registerNumber, password, termsAccepted (must be true).
     * Server creates student account, role is ALWAYS student, email verified, welcome email sent, signs in.
     */
    @Transactional
    public RegisterCompleteResult completeRegistration(RegisterCompleteRequest request, String ip, String userAgent) {
        String cleanRegNo = (request.registerNumber() != null) ? request.registerNumber().trim().toUpperCase() : "";

        // Verify session token
        VerifiedRegistrationSession session = registrationSessions.remove(request.registrationToken());
        if (session == null || session.expiresAt() < System.currentTimeMillis() ||
                !session.registerNumber().equalsIgnoreCase(cleanRegNo)) {
            throw new IllegalArgumentException("Registration session expired or invalid. Please verify your register number again.");
        }

        if (!request.termsAccepted()) {
            throw new IllegalArgumentException("You must accept the Terms of Service and Privacy Notice.");
        }

        StudentRecord record = studentRecordRepository.findByRegisterNumberIgnoreCase(cleanRegNo)
                .orElseThrow(() -> new StudentRecordMismatchException("We couldn't find your college record. Contact your college office."));

        if (userRepository.existsByRegisterNumberIgnoreCase(cleanRegNo) ||
                userRepository.existsByEmailIgnoreCase(record.getEmail())) {
            throw new UserAlreadyExistsException("An account already exists. Sign in instead.");
        }

        // Validate password rules (role parameter sent by client is intentionally ignored)
        passwordPolicyService.validatePasswordRules(request.password(), cleanRegNo, record.getName());

        String userId = "usr-" + UUID.randomUUID().toString().substring(0, 12);
        String passwordHash = passwordEncoder.encode(request.password());

        User newUser = new User(userId, record, record.getEmail(), passwordHash);
        newUser.setEmailVerifiedAt(LocalDateTime.now());
        userRepository.save(newUser);

        // Record initial password in password history
        passwordHistoryRepository.save(new PasswordHistory(userId, passwordHash));

        // Welcome email
        emailService.sendWelcomeEmail(record.getEmail(), record.getName());

        // Generate session tokens
        String accessToken = jwtService.generateAccessToken(newUser);
        createRefreshToken(userId, UUID.randomUUID().toString(), userAgent, refreshTokenDays, ip);

        return new RegisterCompleteResult(
                true,
                "Student account created successfully! Welcome to CampusConnect.",
                accessToken,
                UserDto.from(newUser)
        );
    }

    // ====================================================================
    // 3. FORGOT PASSWORD & RESET (Captcha removed; rate limiting applied)
    // ====================================================================
    @Transactional
    public ForgotPasswordResult forgotPassword(ForgotPasswordRequest request, String ip) {
        String cleanIdentifier = normalizeIdentifier(request.identifier());
        if (cleanIdentifier == null || cleanIdentifier.isBlank()) {
            throw new IllegalArgumentException("Register number or college ID is required.");
        }

        // Abuse protection: rate limit forgot-password requests (20/hour per IP, 5/hour per identifier)
        if (!rateLimiterService.isForgotPasswordAllowed(ip, cleanIdentifier)) {
            throw new RateLimitExceededException("Too many requests, try again later.");
        }

        long startTime = System.currentTimeMillis();
        Optional<User> userOpt = userRepository.findByIdentifier(cleanIdentifier);

        if (userOpt.isPresent()) {
            User user = userOpt.get();
            if (user.isEmailVerified() && rateLimiterService.isDailyEmailCapAllowed(user.getEmail())) {
                String otp = generateOtpCode();
                saveOtpCode(user.getId(), "PASSWORD_RESET", otp);
                emailService.sendPasswordResetOtp(user.getEmail(), user.getStudentRecord().getName(), otp);
            }
        }

        // Constant response timing (~200ms)
        long elapsed = System.currentTimeMillis() - startTime;
        if (elapsed < 200) {
            try {
                Thread.sleep(200 - elapsed);
            } catch (InterruptedException ignored) {}
        }

        return new ForgotPasswordResult(
                "If an account exists, a password reset code has been sent to the registered college email."
        );
    }

    @Transactional
    public ResetPasswordResult resetPassword(ResetPasswordRequest request) {
        String cleanIdentifier = normalizeIdentifier(request.identifier());
        User user = userRepository.findByIdentifier(cleanIdentifier)
                .orElseThrow(() -> new IllegalArgumentException("Account not found."));

        OtpCode otpCode = otpCodeRepository
                .findTopByUserIdAndPurposeAndUsedFalseOrderByCreatedAtDesc(user.getId(), "PASSWORD_RESET")
                .orElseThrow(() -> new IllegalArgumentException("No pending reset code found. Please request a new one."));

        if (otpCode.isExpired()) {
            otpCode.setUsed(true);
            otpCodeRepository.save(otpCode);
            throw new IllegalArgumentException("Reset code has expired. Please request a new one.");
        }

        otpCode.setAttempts(otpCode.getAttempts() + 1);
        if (otpCode.getAttempts() > 5) {
            otpCode.setUsed(true);
            otpCodeRepository.save(otpCode);
            throw new IllegalArgumentException("Maximum attempts exceeded. Please request a new reset code.");
        }

        String inputHash = hashOtp(request.otp().trim());
        boolean matches = MessageDigest.isEqual(
                otpCode.getCodeHash().getBytes(StandardCharsets.UTF_8),
                inputHash.getBytes(StandardCharsets.UTF_8)
        );

        if (!matches) {
            otpCodeRepository.save(otpCode);
            throw new IllegalArgumentException("Incorrect reset code.");
        }

        otpCode.setUsed(true);
        otpCodeRepository.save(otpCode);

        // Password rules
        passwordPolicyService.validatePasswordRules(request.newPassword(), user.getStudentRecord().getRegisterNumber(), user.getStudentRecord().getName());
        passwordPolicyService.validatePasswordHistory(user.getId(), request.newPassword());

        String newHash = passwordEncoder.encode(request.newPassword());
        user.setPasswordHash(newHash);
        user.setFailedAttempts(0);
        user.setLockedUntil(null);
        userRepository.save(user);

        passwordHistoryRepository.save(new PasswordHistory(user.getId(), newHash));
        refreshTokenRepository.revokeAllForUser(user.getId(), LocalDateTime.now());

        emailService.sendPasswordChangedAlert(user.getEmail(), user.getStudentRecord().getName(), "Password Reset");

        return new ResetPasswordResult("Password has been successfully reset. Please sign in with your new password.");
    }

    @Transactional
    public void changePassword(String userId, ChangePasswordRequest request, String deviceInfo) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found."));

        if (!passwordEncoder.matches(request.currentPassword(), user.getPasswordHash())) {
            throw new InvalidCredentialsException("Current password is incorrect.");
        }

        passwordPolicyService.validatePasswordRules(request.newPassword(), user.getStudentRecord().getRegisterNumber(), user.getStudentRecord().getName());
        passwordPolicyService.validatePasswordHistory(userId, request.newPassword());

        String newHash = passwordEncoder.encode(request.newPassword());
        user.setPasswordHash(newHash);
        userRepository.save(user);

        passwordHistoryRepository.save(new PasswordHistory(userId, newHash));
        refreshTokenRepository.revokeAllForUser(userId, LocalDateTime.now());

        emailService.sendPasswordChangedAlert(user.getEmail(), user.getStudentRecord().getName(), deviceInfo);
    }

    // ====================================================================
    // 4. SESSIONS & REFRESH TOKENS
    // ====================================================================
    @Transactional
    public TokenRefreshResult refreshToken(String rawRefreshToken, String ip, String userAgent) {
        if (rawRefreshToken == null || rawRefreshToken.isBlank()) {
            throw new InvalidTokenException("Refresh token is required.");
        }

        String tokenHash = hashToken(rawRefreshToken);
        RefreshToken token = refreshTokenRepository.findByTokenHash(tokenHash)
                .orElseThrow(() -> new InvalidTokenException("Invalid refresh token."));

        if (token.isRevoked()) {
            log.warn("Token reuse detected for family: {}. Revoking all tokens in family.", token.getFamilyId());
            refreshTokenRepository.revokeFamily(token.getFamilyId(), LocalDateTime.now());
            throw new TokenReusedException("Security violation: revoked token was presented. All sessions in this chain have been terminated.");
        }

        if (token.isExpired()) {
            throw new TokenExpiredException("Refresh token has expired. Please sign in again.");
        }

        token.setRevokedAt(LocalDateTime.now());
        String newRawToken = UUID.randomUUID().toString();
        String newHash = hashToken(newRawToken);

        token.setReplacedBy(newHash);
        refreshTokenRepository.save(token);

        RefreshToken newToken = new RefreshToken(
                UUID.randomUUID().toString(),
                token.getFamilyId(),
                token.getUserId(),
                newHash,
                userAgent,
                ip,
                LocalDateTime.now().plusDays(refreshTokenDays)
        );
        refreshTokenRepository.save(newToken);

        User user = userRepository.findById(token.getUserId())
                .orElseThrow(() -> new InvalidTokenException("User no longer exists."));

        String newAccessToken = jwtService.generateAccessToken(user);
        return new TokenRefreshResult(newAccessToken, newRawToken);
    }

    @Transactional
    public void logout(String rawRefreshToken) {
        if (rawRefreshToken == null || rawRefreshToken.isBlank()) return;
        String tokenHash = hashToken(rawRefreshToken);
        refreshTokenRepository.findByTokenHash(tokenHash).ifPresent(token -> {
            token.setRevokedAt(LocalDateTime.now());
            refreshTokenRepository.save(token);
        });
    }

    @Transactional
    public void revokeSession(String userId, String sessionId) {
        refreshTokenRepository.findById(sessionId).ifPresent(token -> {
            if (token.getUserId().equals(userId)) {
                refreshTokenRepository.revokeFamily(token.getFamilyId(), LocalDateTime.now());
            }
        });
    }

    @Transactional
    public void revokeAllSessions(String userId) {
        refreshTokenRepository.revokeAllForUser(userId, LocalDateTime.now());
    }

    public List<SessionInfo> getActiveSessions(String userId) {
        List<RefreshToken> active = refreshTokenRepository.findByUserIdAndRevokedAtIsNullAndExpiresAtAfterOrderByLastActiveAtDesc(userId, LocalDateTime.now());
        List<SessionInfo> result = new ArrayList<>();
        for (RefreshToken t : active) {
            result.add(new SessionInfo(t.getId(), t.getDeviceInfo(), t.getIp(), t.getLastActiveAt(), t.getCreatedAt()));
        }
        return result;
    }

    public List<LoginEventDto> getRecentLoginEvents(String userId) {
        return loginEventRepository.findTop10ByUserIdOrderByAtDesc(userId)
                .stream()
                .map(ev -> new LoginEventDto(ev.getId(), ev.getIp(), ev.getDevice(), ev.isSuccess(), ev.getReason(), ev.getAt()))
                .toList();
    }

    public String createRefreshToken(String userId, String familyId, String deviceInfo, int days, String ip) {
        String rawToken = UUID.randomUUID().toString();
        String hash = hashToken(rawToken);

        RefreshToken rt = new RefreshToken(
                UUID.randomUUID().toString(),
                familyId,
                userId,
                hash,
                deviceInfo,
                ip,
                LocalDateTime.now().plusDays(days)
        );
        refreshTokenRepository.save(rt);
        return rawToken;
    }

    private String generateOtpCode() {
        int code = 100000 + RANDOM.nextInt(900000); // 6 digits
        return String.valueOf(code);
    }

    private void saveOtpCode(String userId, String purpose, String rawOtp) {
        String hash = hashOtp(rawOtp);
        LocalDateTime expiresAt = LocalDateTime.now().plusMinutes(otpExpirationMinutes);
        OtpCode otpCode = new OtpCode(userId, purpose, hash, expiresAt);
        otpCodeRepository.save(otpCode);
    }

    private String hashOtp(String otp) {
        return hashString("otp:" + otp.trim());
    }

    private String hashToken(String token) {
        return hashString("token:" + token.trim());
    }

    private String hashString(String input) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] bytes = md.digest(input.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(bytes);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 missing", e);
        }
    }

    private String normalizeIdentifier(String identifier) {
        if (identifier == null) return null;
        return identifier.trim().toLowerCase();
    }

    private String maskId(String id) {
        if (id == null || id.length() <= 4) return "****";
        return id.substring(0, 3) + "****";
    }

    // Custom runtime exceptions
    public static class InvalidCredentialsException extends RuntimeException {
        public InvalidCredentialsException(String message) { super(message); }
    }

    public static class AccountLockedException extends RuntimeException {
        private final long remainingSeconds;
        public AccountLockedException(String message, long remainingSeconds) {
            super(message);
            this.remainingSeconds = remainingSeconds;
        }
        public long getRemainingSeconds() { return remainingSeconds; }
    }

    public static class InvalidCaptchaException extends RuntimeException {
        public InvalidCaptchaException(String message) { super(message); }
    }

    public static class StudentRecordMismatchException extends RuntimeException {
        public StudentRecordMismatchException(String message) { super(message); }
    }

    public static class UserAlreadyExistsException extends RuntimeException {
        public UserAlreadyExistsException(String message) { super(message); }
    }

    public static class InvalidTokenException extends RuntimeException {
        public InvalidTokenException(String message) { super(message); }
    }

    public static class TokenExpiredException extends RuntimeException {
        public TokenExpiredException(String message) { super(message); }
    }

    public static class TokenReusedException extends RuntimeException {
        public TokenReusedException(String message) { super(message); }
    }

    public static class RateLimitExceededException extends RuntimeException {
        public RateLimitExceededException(String message) { super(message); }
    }

    public static class InvalidOtpException extends RuntimeException {
        public InvalidOtpException(String message) { super(message); }
    }
}
