package com.campusconnect.service;

import com.campusconnect.repository.CaptchaChallengeRepository;
import com.campusconnect.repository.OtpCodeRepository;
import com.campusconnect.repository.RefreshTokenRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class ScheduledCleanupService {

    private static final Logger log = LoggerFactory.getLogger(ScheduledCleanupService.class);

    private final CaptchaChallengeRepository captchaRepository;
    private final OtpCodeRepository otpRepository;
    private final RefreshTokenRepository refreshTokenRepository;

    public ScheduledCleanupService(
            CaptchaChallengeRepository captchaRepository,
            OtpCodeRepository otpRepository,
            RefreshTokenRepository refreshTokenRepository) {
        this.captchaRepository = captchaRepository;
        this.otpRepository = otpRepository;
        this.refreshTokenRepository = refreshTokenRepository;
    }

    /**
     * Runs every 10 minutes to clean up expired captchas, OTPs, and stale refresh tokens.
     */
    @Scheduled(fixedRate = 600000)
    @Transactional
    public void performScheduledCleanup() {
        LocalDateTime now = LocalDateTime.now();
        int deletedCaptchas = captchaRepository.deleteExpiredOrUsed(now);
        int deletedOtps = otpRepository.deleteExpiredOrUsed(now);
        int deletedTokens = refreshTokenRepository.deleteExpired(now);

        if (deletedCaptchas > 0 || deletedOtps > 0 || deletedTokens > 0) {
            log.info("Scheduled cleanup: evicted {} captchas, {} OTPs, {} refresh tokens.",
                    deletedCaptchas, deletedOtps, deletedTokens);
        }
    }
}
