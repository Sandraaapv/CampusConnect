package com.campusconnect.repository;

import com.campusconnect.model.OtpCode;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface OtpCodeRepository extends JpaRepository<OtpCode, Long> {
    Optional<OtpCode> findTopByUserIdAndPurposeAndUsedFalseOrderByCreatedAtDesc(String userId, String purpose);

    List<OtpCode> findByUserIdAndPurposeAndCreatedAtAfter(String userId, String purpose, LocalDateTime after);

    @Modifying
    @Query("UPDATE OtpCode o SET o.used = true WHERE o.userId = :userId AND o.purpose = :purpose")
    void markAllUsed(String userId, String purpose);

    @Modifying
    @Query("DELETE FROM OtpCode o WHERE o.expiresAt < :now OR o.used = true")
    int deleteExpiredOrUsed(LocalDateTime now);
}
