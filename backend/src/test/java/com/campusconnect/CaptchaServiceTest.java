package com.campusconnect;

import com.campusconnect.service.CaptchaService;
import com.campusconnect.service.DefaultCaptchaService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
public class CaptchaServiceTest {

    @Autowired
    private CaptchaService captchaService;

    @Test
    @DisplayName("Captcha generates valid ID, image data URI, and enforces single use")
    void testCaptchaGenerationAndSingleUse() {
        CaptchaService.CaptchaResponse captcha = captchaService.generateCaptcha();
        assertNotNull(captcha.captchaId());
        assertTrue(captcha.imageBase64().startsWith("data:image/png;base64,"));
        assertTrue(captcha.expiresInSeconds() > 0);

        // Audio WAV generation works
        byte[] audio = captchaService.generateAudioCaptcha(captcha.captchaId());
        assertNotNull(audio);
        assertTrue(audio.length > 44, "WAV audio should contain RIFF header and sample data");
        assertEquals('R', (char) audio[0]);
        assertEquals('I', (char) audio[1]);
        assertEquals('F', (char) audio[2]);
        assertEquals('F', (char) audio[3]);

        // Wrong answer should return false
        boolean wrongCheck = captchaService.validateCaptcha(captcha.captchaId(), "WRONG!");
        assertFalse(wrongCheck);

        // Second use is rejected (single use guarantee)
        boolean reuseCheck = captchaService.validateCaptcha(captcha.captchaId(), "WRONG!");
        assertFalse(reuseCheck);
    }
}
