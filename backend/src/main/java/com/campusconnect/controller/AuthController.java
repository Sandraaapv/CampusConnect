package com.campusconnect.controller;

import com.campusconnect.dto.*;
import com.campusconnect.model.User;
import com.campusconnect.service.AuthService;
import com.campusconnect.service.CaptchaService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private static final String REFRESH_COOKIE_NAME = "campusconnect_refresh_token";

    private final AuthService authService;
    private final CaptchaService captchaService;
    private final int refreshTokenDays;
    private final int rememberMeDays;

    public AuthController(
            AuthService authService,
            CaptchaService captchaService,
            @Value("${campusconnect.jwt.refresh-token-expiration-days:7}") int refreshTokenDays,
            @Value("${campusconnect.jwt.remember-me-refresh-token-days:30}") int rememberMeDays) {
        this.authService = authService;
        this.captchaService = captchaService;
        this.refreshTokenDays = refreshTokenDays;
        this.rememberMeDays = rememberMeDays;
    }

    @GetMapping("/config")
    public ResponseEntity<Map<String, Object>> getConfig() {
        Map<String, Object> config = new HashMap<>();
        config.put("collegeEmailDomain", authService.getCollegeEmailDomain());
        config.put("loginIdSuffix", authService.getLoginIdSuffix());
        return ResponseEntity.ok(config);
    }

    @GetMapping("/captcha")
    public ResponseEntity<CaptchaService.CaptchaResponse> getCaptcha() {
        CaptchaService.CaptchaResponse captcha = captchaService.generateCaptcha();
        return ResponseEntity.ok(captcha);
    }

    @GetMapping(value = "/captcha/{id}/audio", produces = "audio/wav")
    public ResponseEntity<byte[]> getCaptchaAudio(@PathVariable("id") String captchaId) {
        byte[] wavAudio = captchaService.generateAudioCaptcha(captchaId);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"captcha.wav\"")
                .contentType(MediaType.parseMediaType("audio/wav"))
                .body(wavAudio);
    }

    @PostMapping("/register/send-code")
    public ResponseEntity<RegisterSendCodeResult> sendRegistrationCode(
            @Valid @RequestBody RegisterSendCodeRequest request,
            HttpServletRequest httpRequest) {
        String ip = extractClientIp(httpRequest);
        String userAgent = extractUserAgent(httpRequest);
        RegisterSendCodeResult result = authService.sendRegistrationCode(request, ip, userAgent);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/register/verify-code")
    public ResponseEntity<RegisterVerifyCodeResult> verifyRegistrationCode(
            @Valid @RequestBody RegisterVerifyCodeRequest request,
            HttpServletRequest httpRequest) {
        String ip = extractClientIp(httpRequest);
        RegisterVerifyCodeResult result = authService.verifyRegistrationCode(request, ip);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/register/complete")
    public ResponseEntity<RegisterCompleteResult> completeRegistration(
            @Valid @RequestBody RegisterCompleteRequest request,
            HttpServletRequest httpRequest,
            HttpServletResponse response) {
        String ip = extractClientIp(httpRequest);
        String userAgent = extractUserAgent(httpRequest);
        RegisterCompleteResult result = authService.completeRegistration(request, ip, userAgent);
        return ResponseEntity.status(HttpStatus.CREATED).body(result);
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(
            @Valid @RequestBody LoginRequest request,
            HttpServletRequest httpRequest,
            HttpServletResponse response) {
        String ip = extractClientIp(httpRequest);
        String userAgent = extractUserAgent(httpRequest);
        LoginResult result = authService.login(request, ip, userAgent);

        Map<String, Object> body = new HashMap<>();
        body.put("emailVerified", result.emailVerified());
        body.put("message", result.message());

        if (result.emailVerified()) {
            int days = request.keepSignedIn() ? rememberMeDays : refreshTokenDays;
            setRefreshTokenCookie(response, result.rawRefreshToken(), days);
            body.put("accessToken", result.accessToken());
            body.put("user", UserDto.from(result.user()));
        } else {
            body.put("user", UserDto.from(result.user()));
        }

        return ResponseEntity.ok(body);
    }

    @PostMapping("/refresh")
    public ResponseEntity<Map<String, Object>> refresh(
            HttpServletRequest httpRequest,
            HttpServletResponse response) {
        String rawToken = extractRefreshTokenFromCookie(httpRequest);
        String ip = extractClientIp(httpRequest);
        String userAgent = extractUserAgent(httpRequest);

        TokenRefreshResult result = authService.refreshToken(rawToken, ip, userAgent);
        setRefreshTokenCookie(response, result.refreshToken(), refreshTokenDays);

        Map<String, Object> body = new HashMap<>();
        body.put("accessToken", result.accessToken());
        return ResponseEntity.ok(body);
    }

    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout(
            HttpServletRequest httpRequest,
            HttpServletResponse response) {
        String rawToken = extractRefreshTokenFromCookie(httpRequest);
        authService.logout(rawToken);
        clearRefreshTokenCookie(response);

        Map<String, String> body = new HashMap<>();
        body.put("message", "Logged out successfully.");
        return ResponseEntity.ok(body);
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<ForgotPasswordResult> forgotPassword(
            @Valid @RequestBody ForgotPasswordRequest request,
            HttpServletRequest httpRequest) {
        String ip = extractClientIp(httpRequest);
        ForgotPasswordResult result = authService.forgotPassword(request, ip);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/reset-password")
    public ResponseEntity<ResetPasswordResult> resetPassword(
            @Valid @RequestBody ResetPasswordRequest request,
            HttpServletResponse response) {
        ResetPasswordResult result = authService.resetPassword(request);
        clearRefreshTokenCookie(response);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/change-password")
    public ResponseEntity<Map<String, String>> changePassword(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody ChangePasswordRequest request,
            HttpServletRequest httpRequest) {
        String deviceInfo = extractUserAgent(httpRequest);
        authService.changePassword(user.getId(), request, deviceInfo);

        Map<String, String> body = new HashMap<>();
        body.put("message", "Password changed successfully.");
        return ResponseEntity.ok(body);
    }

    @GetMapping("/sessions")
    public ResponseEntity<List<SessionInfo>> getSessions(@AuthenticationPrincipal User user) {
        List<SessionInfo> sessions = authService.getActiveSessions(user.getId());
        return ResponseEntity.ok(sessions);
    }

    @DeleteMapping("/sessions/{id}")
    public ResponseEntity<Map<String, String>> revokeSession(
            @AuthenticationPrincipal User user,
            @PathVariable("id") String sessionId) {
        authService.revokeSession(user.getId(), sessionId);
        Map<String, String> body = new HashMap<>();
        body.put("message", "Session revoked.");
        return ResponseEntity.ok(body);
    }

    @DeleteMapping("/sessions")
    public ResponseEntity<Map<String, String>> revokeAllSessions(
            @AuthenticationPrincipal User user,
            HttpServletResponse response) {
        authService.revokeAllSessions(user.getId());
        clearRefreshTokenCookie(response);
        Map<String, String> body = new HashMap<>();
        body.put("message", "All active sessions revoked.");
        return ResponseEntity.ok(body);
    }

    @GetMapping("/me")
    public ResponseEntity<UserDto> getMe(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(UserDto.from(user));
    }

    @GetMapping("/login-events")
    public ResponseEntity<List<LoginEventDto>> getLoginEvents(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(authService.getRecentLoginEvents(user.getId()));
    }

    private void setRefreshTokenCookie(HttpServletResponse response, String token, int days) {
        ResponseCookie cookie = ResponseCookie.from(REFRESH_COOKIE_NAME, token)
                .httpOnly(true)
                .secure(false) // Set to true behind HTTPS proxy in production
                .sameSite("Lax")
                .path("/auth")
                .maxAge(days * 86400L)
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }

    private void clearRefreshTokenCookie(HttpServletResponse response) {
        ResponseCookie cookie = ResponseCookie.from(REFRESH_COOKIE_NAME, "")
                .httpOnly(true)
                .secure(false)
                .sameSite("Lax")
                .path("/auth")
                .maxAge(0)
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }

    private String extractRefreshTokenFromCookie(HttpServletRequest request) {
        if (request.getCookies() == null) return null;
        for (Cookie cookie : request.getCookies()) {
            if (REFRESH_COOKIE_NAME.equals(cookie.getName())) {
                return cookie.getValue();
            }
        }
        return null;
    }

    private String extractClientIp(HttpServletRequest request) {
        String xf = request.getHeader("X-Forwarded-For");
        if (xf != null && !xf.isBlank()) {
            return xf.split(",")[0].trim();
        }
        return request.getRemoteAddr() != null ? request.getRemoteAddr() : "127.0.0.1";
    }

    private String extractUserAgent(HttpServletRequest request) {
        String ua = request.getHeader("User-Agent");
        return (ua != null && !ua.isBlank()) ? ua : "Unknown device";
    }
}
