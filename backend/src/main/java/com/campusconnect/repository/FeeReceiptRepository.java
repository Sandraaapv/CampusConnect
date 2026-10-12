package com.campusconnect.repository;

import com.campusconnect.model.FeeReceipt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FeeReceiptRepository extends JpaRepository<FeeReceipt, String> {
    Optional<FeeReceipt> findByIdAndRegisterNumber(String id, String registerNumber);
    Optional<FeeReceipt> findByVerifyToken(String verifyToken);
    Optional<FeeReceipt> findByPaymentId(String paymentId);
}
