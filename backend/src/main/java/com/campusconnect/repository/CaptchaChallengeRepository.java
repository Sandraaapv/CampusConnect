package com.campusconnect.repository;

import com.campusconnect.model.CaptchaChallenge;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;

@Repository
public interface CaptchaChallengeRepository extends JpaRepository<CaptchaChallenge, String> {
    @Modifying
    @Query("DELETE FROM CaptchaChallenge c WHERE c.expiresAt < :now OR c.used = true")
    int deleteExpiredOrUsed(LocalDateTime now);
}
