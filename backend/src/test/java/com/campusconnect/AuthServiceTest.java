package com.campusconnect;

import com.campusconnect.dto.*;
import com.campusconnect.model.OtpCode;
import com.campusconnect.model.StudentRecord;
import com.campusconnect.model.User;
import com.campusconnect.repository.OtpCodeRepository;
import com.campusconnect.repository.StudentRecordRepository;
import com.campusconnect.repository.UserRepository;
import com.campusconnect.service.AuthService;
import com.campusconnect.service.AuthService.*;
import com.campusconnect.service.PasswordPolicyService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.lang.reflect.Method;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
public class AuthServiceTest {

    @Autowired
    private AuthService authService;

    @Autowired
    private PasswordPolicyService passwordPolicyService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StudentRecordRepository studentRecordRepository;

    @Autowired
    private OtpCodeRepository otpCodeRepository;

    @Test
    @DisplayName("Password policy rejects short passwords, missing symbols, common passwords, or passwords containing ID")
    void testPasswordPolicyRules() {
        // Less than 10 chars
        assertThrows(IllegalArgumentException.class, () ->
                passwordPolicyService.validatePasswordRules("Pass1!", "21CS042", "Aarav"));

        // Missing symbol
        assertThrows(IllegalArgumentException.class, () ->
                passwordPolicyService.validatePasswordRules("Password12345", "21CS042", "Aarav"));

        // Contains ID
        assertThrows(IllegalArgumentException.class, () ->
                passwordPolicyService.validatePasswordRules("21CS042@SecretPass!", "21CS042", "Aarav"));

        // Common password
        assertThrows(IllegalArgumentException.class, () ->
                passwordPolicyService.validatePasswordRules("password@123", "21CS099", "Rahul"));

        // Valid strong password
        assertDoesNotThrow(() ->
                passwordPolicyService.validatePasswordRules("SuperSecure#2026", "21CS042", "Aarav"));
    }

    @Test
    @DisplayName("Demo student (21CS042) can login without captcha when demo flag is true")
    void testDemoLogin() {
        LoginRequest req = new LoginRequest("21CS042", "StudentDemo@2026!", null, null, false, true);
        LoginResult result = authService.login(req, "127.0.0.1", "UnitTestBrowser");

        assertTrue(result.emailVerified());
        assertNotNull(result.accessToken());
        assertNotNull(result.rawRefreshToken());
        assertEquals("21CS042", result.user().getStudentRecord().getRegisterNumber());
    }

    @Test
    @DisplayName("Login with wrong password returns uniform error message")
    void testWrongPasswordUniformError() {
        LoginRequest req = new LoginRequest("21CS042", "WrongPassword!99", null, null, false, true);
        InvalidCredentialsException ex = assertThrows(InvalidCredentialsException.class, () ->
                authService.login(req, "127.0.0.1", "UnitTestBrowser"));

        assertEquals("ID or password is incorrect.", ex.getMessage());
    }

    @Test
    @DisplayName("5 consecutive failed logins triggers 15-minute account lockout")
    void testAccountLockoutAfter5Failures() {
        for (int i = 0; i < 4; i++) {
            LoginRequest req = new LoginRequest("21CS042", "WrongPassword!99", null, null, false, true);
            assertThrows(InvalidCredentialsException.class, () ->
                    authService.login(req, "127.0.0.1", "UnitTestBrowser"));
        }

        // 5th failed attempt triggers lock
        LoginRequest req5 = new LoginRequest("21CS042", "WrongPassword!99", null, null, false, true);
        assertThrows(InvalidCredentialsException.class, () ->
                authService.login(req5, "127.0.0.1", "UnitTestBrowser"));

        // Next attempt immediately throws AccountLockedException with countdown
        LoginRequest req6 = new LoginRequest("21CS042", "StudentDemo@2026!", null, null, false, true);
        AccountLockedException lockEx = assertThrows(AccountLockedException.class, () ->
                authService.login(req6, "127.0.0.1", "UnitTestBrowser"));

        assertTrue(lockEx.getMessage().contains("locked"));
        assertTrue(lockEx.getRemainingSeconds() > 0);
    }

    @Test
    @DisplayName("Refresh token rotation issues new token and replaying old token revokes family")
    void testRefreshTokenRotationAndReuseDetection() {
        LoginRequest loginReq = new LoginRequest("21CS042", "StudentDemo@2026!", null, null, false, true);
        LoginResult loginResult = authService.login(loginReq, "127.0.0.1", "UnitTestBrowser");
        String initialRefreshToken = loginResult.rawRefreshToken();

        // 1. First rotation succeeds
        TokenRefreshResult rotateResult = authService.refreshToken(initialRefreshToken, "127.0.0.1", "UnitTestBrowser");
        assertNotNull(rotateResult.accessToken());
        assertNotNull(rotateResult.refreshToken());
        assertNotEquals(initialRefreshToken, rotateResult.refreshToken());

        // 2. Replaying the OLD initial refresh token must trigger TokenReusedException
        assertThrows(TokenReusedException.class, () ->
                authService.refreshToken(initialRefreshToken, "127.0.0.1", "AttackerBrowser"));

        // 3. And subsequent rotation with the new token should now ALSO fail because family was revoked!
        assertThrows(TokenReusedException.class, () ->
                authService.refreshToken(rotateResult.refreshToken(), "127.0.0.1", "UnitTestBrowser"));
    }

    @Test
    @DisplayName("Step 1: Known record gets masked email; unknown register number gets identical response and no email")
    void testStep1FindRecord() {
        // Ensure 21CSC105 is in student records
        if (!studentRecordRepository.existsByRegisterNumberIgnoreCase("21CSC105")) {
            studentRecordRepository.save(new StudentRecord("21CSC105", "ananya.sen@campus.test", "Ananya Sen", "Computer Science & Engineering", 6));
        }

        // Known register number
        RegisterSendCodeResult known = authService.sendRegistrationCode(new RegisterSendCodeRequest("21csc105"), "127.0.0.1", "UnitTest");
        assertEquals("If this register number is eligible, we sent a code to the college email on record.", known.message());
        assertNotNull(known.maskedEmail());
        assertTrue(known.maskedEmail().contains("@"));

        // Unknown register number (e.g. 99XYZ999)
        RegisterSendCodeResult unknown = authService.sendRegistrationCode(new RegisterSendCodeRequest("99XYZ999"), "127.0.0.1", "UnitTest");
        assertEquals("If this register number is eligible, we sent a code to the college email on record.", unknown.message());
        assertNull(unknown.maskedEmail(), "Unknown register number must NOT reveal a masked email");
    }

    @Test
    @DisplayName("Step 2 & 3: Correct OTP verifies identity; already-registered fails only at Step 2; client role ignored")
    void testStep2AndStep3RegistrationFlow() throws Exception {
        // Ensure 21CSC105 student record exists and is not yet registered
        if (!studentRecordRepository.existsByRegisterNumberIgnoreCase("21CSC105")) {
            studentRecordRepository.save(new StudentRecord("21CSC105", "ananya.sen@campus.test", "Ananya Sen", "Computer Science & Engineering", 6));
        }
        userRepository.findByIdentifier("21CSC105").ifPresent(userRepository::delete);

        // Step 1: Send code
        authService.sendRegistrationCode(new RegisterSendCodeRequest("21CSC105"), "127.0.0.1", "UnitTest");

        // Verify wrong code fails
        assertThrows(InvalidOtpException.class, () ->
                authService.verifyRegistrationCode(new RegisterVerifyCodeRequest("21CSC105", "000000"), "127.0.0.1"));

        // Set a known OTP in database for test determinism
        java.security.MessageDigest md = java.security.MessageDigest.getInstance("SHA-256");
        String hash1 = java.util.Base64.getEncoder().encodeToString(md.digest("otp:882244".getBytes(java.nio.charset.StandardCharsets.UTF_8)));
        otpCodeRepository.save(new OtpCode("21CSC105", "REGISTRATION_FLOW", hash1, java.time.LocalDateTime.now().plusMinutes(10)));

        // Step 2: Verify with correct code
        RegisterVerifyCodeResult verifyRes = authService.verifyRegistrationCode(new RegisterVerifyCodeRequest("21CSC105", "882244"), "127.0.0.1");
        assertTrue(verifyRes.success());
        assertNotNull(verifyRes.registrationToken());
        assertEquals("Ananya Sen", verifyRes.student().name());
        assertEquals("Computer Science & Engineering", verifyRes.student().department());
        assertEquals(6, verifyRes.student().semester());

        // Step 3: Complete registration (client sends role='ROLE_ADMIN', must be strictly ignored!)
        RegisterCompleteRequest completeReq = new RegisterCompleteRequest(
                verifyRes.registrationToken(),
                "21CSC105",
                "SuperSecure#2026",
                true,
                "ROLE_ADMIN" // Malicious client attempt
        );
        RegisterCompleteResult completeRes = authService.completeRegistration(completeReq, "127.0.0.1", "UnitTest");
        assertTrue(completeRes.success());
        assertNotNull(completeRes.accessToken());
        assertEquals("Ananya Sen", completeRes.user().name());
        assertTrue(completeRes.user().emailVerified());

        // Re-verifying for an already registered account must fail at Step 2 with the sign-in message
        md.reset();
        String hash2 = java.util.Base64.getEncoder().encodeToString(md.digest("otp:991122".getBytes(java.nio.charset.StandardCharsets.UTF_8)));
        otpCodeRepository.save(new OtpCode("21CSC105", "REGISTRATION_FLOW", hash2, java.time.LocalDateTime.now().plusMinutes(10)));

        UserAlreadyExistsException ex = assertThrows(UserAlreadyExistsException.class, () ->
                authService.verifyRegistrationCode(new RegisterVerifyCodeRequest("21CSC105", "991122"), "127.0.0.1"));
        assertEquals("An account already exists. Sign in instead.", ex.getMessage());
    }

    @Test
    @DisplayName("Forgot password operates without captcha and returns uniform response")
    void testForgotPasswordWithoutCaptcha() {
        ForgotPasswordResult res = authService.forgotPassword(new ForgotPasswordRequest("21CS042"), "127.0.0.1");
        assertTrue(res.message().contains("college email"));

        // Unknown account returns identical message
        ForgotPasswordResult resUnknown = authService.forgotPassword(new ForgotPasswordRequest("99UNKNOWN"), "127.0.0.1");
        assertEquals(res.message(), resUnknown.message());
    }
}
