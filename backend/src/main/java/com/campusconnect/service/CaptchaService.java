package com.campusconnect.service;

public interface CaptchaService {
    CaptchaResponse generateCaptcha();
    byte[] generateAudioCaptcha(String captchaId);
    boolean validateCaptcha(String captchaId, String answer);

    record CaptchaResponse(String captchaId, String imageBase64, int expiresInSeconds) {}
}
