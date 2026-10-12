package com.campusconnect.service;

import com.campusconnect.dto.FeeStatusSummaryDto;
import com.campusconnect.model.*;
import com.campusconnect.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
public class FeeService {

    private final FeeStructureRepository feeStructureRepository;
    private final FeePaymentRepository feePaymentRepository;
    private final FeeReceiptRepository feeReceiptRepository;
    private final UserRepository userRepository;
    private final StudentRequestRepository requestRepository;
    private final RequestDeptStageRepository deptStageRepository;

    public FeeService(
            FeeStructureRepository feeStructureRepository,
            FeePaymentRepository feePaymentRepository,
            FeeReceiptRepository feeReceiptRepository,
            UserRepository userRepository,
            StudentRequestRepository requestRepository,
            RequestDeptStageRepository deptStageRepository) {
        this.feeStructureRepository = feeStructureRepository;
        this.feePaymentRepository = feePaymentRepository;
        this.feeReceiptRepository = feeReceiptRepository;
        this.userRepository = userRepository;
        this.requestRepository = requestRepository;
        this.deptStageRepository = deptStageRepository;
    }

    public FeeStatusSummaryDto getFeeStatusSummary(String studentId, Integer semesterOverride) {
        int semester = semesterOverride != null ? semesterOverride : 6;
        List<FeeStructure> breakdown = feeStructureRepository.findBySemester(semester);
        double totalFee = breakdown.stream().mapToDouble(FeeStructure::getAmount).sum();

        List<FeePayment> payments = feePaymentRepository.findByStudentIdAndSemester(studentId, semester);
        double paid = payments.stream()
                .filter(p -> "success".equalsIgnoreCase(p.getStatus()))
                .mapToDouble(FeePayment::getAmount)
                .sum();

        double balanceDue = Math.max(0.0, totalFee - paid);
        String dueDate = "2026-10-31";
        String status = balanceDue <= 0 ? "paid" : "due";

        return new FeeStatusSummaryDto(
                semester,
                totalFee,
                paid,
                balanceDue,
                dueDate,
                status,
                "", // internal payment portal
                breakdown,
                payments
        );
    }

    public List<FeePayment> getFeePayments(String studentId, Integer semester) {
        if (semester != null) {
            return feePaymentRepository.findByStudentIdAndSemester(studentId, semester);
        }
        return feePaymentRepository.findByStudentId(studentId);
    }

    public FeeReceipt getReceiptById(String studentId, String receiptId) {
        User user = userRepository.findById(studentId).orElse(null);
        String regNo = user != null ? user.getRegisterNumber() : "";
        return feeReceiptRepository.findByIdAndRegisterNumber(receiptId, regNo)
                .orElse(feeReceiptRepository.findById(receiptId).orElse(null));
    }

    public Map<String, Object> verifyReceiptToken(String token) {
        Optional<FeeReceipt> receiptOpt = feeReceiptRepository.findByVerifyToken(token);
        if (receiptOpt.isEmpty()) {
            return Map.of("valid", false);
        }
        FeeReceipt receipt = receiptOpt.get();
        return Map.of(
                "valid", true,
                "receipt", receipt,
                "student", Map.of(
                        "name", receipt.getStudentName(),
                        "registerNumber", receipt.getRegisterNumber(),
                        "department", receipt.getDepartment()
                )
        );
    }

    @Transactional
    public Map<String, Object> payFees(
            String studentId,
            int semester,
            String mode,
            String idempotencyKey,
            String cardNumber) {

        // Idempotency check: if reference matches idempotencyKey, return existing receipt
        if (idempotencyKey != null && !idempotencyKey.isBlank()) {
            List<FeePayment> existing = feePaymentRepository.findByStudentId(studentId);
            for (FeePayment p : existing) {
                if (idempotencyKey.equals(p.getReference())) {
                    Optional<FeeReceipt> receipt = feeReceiptRepository.findByPaymentId(p.getId());
                    return Map.of(
                            "success", true,
                            "idempotent", true,
                            "payment", p,
                            "receipt", receipt.orElse(null)
                    );
                }
            }
        }

        // 1. Payment amount is always computed on the server
        List<FeeStructure> breakdown = feeStructureRepository.findBySemester(semester);
        double totalFee = breakdown.stream().mapToDouble(FeeStructure::getAmount).sum();

        List<FeePayment> pastPayments = feePaymentRepository.findByStudentIdAndSemester(studentId, semester);
        double alreadyPaid = pastPayments.stream()
                .filter(p -> "success".equalsIgnoreCase(p.getStatus()))
                .mapToDouble(FeePayment::getAmount)
                .sum();

        double amountToPay = Math.max(0.0, totalFee - alreadyPaid);
        if (amountToPay <= 0) {
            return Map.of("success", false, "error", "No outstanding fee balance due for semester " + semester);
        }

        // 2. Only the last 4 card digits are stored
        String last4 = null;
        if (cardNumber != null && cardNumber.replaceAll("\\s+", "").length() >= 4) {
            String sanitized = cardNumber.replaceAll("\\s+", "");
            last4 = sanitized.substring(sanitized.length() - 4);
        }

        String paymentId = "pay-" + System.currentTimeMillis();
        String ref = (idempotencyKey != null && !idempotencyKey.isBlank())
                ? idempotencyKey
                : "TXN_CC_" + System.currentTimeMillis();

        String now = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm"));

        FeePayment payment = new FeePayment(
                paymentId,
                studentId,
                semester,
                amountToPay,
                mode != null ? mode : "Online",
                ref,
                now,
                "success",
                "Semester " + semester + " Tuition & Composite Fee Settlement",
                last4
        );
        feePaymentRepository.save(payment);

        User user = userRepository.findById(studentId).orElse(null);
        String studentName = user != null && user.getName() != null ? user.getName() : "Student";
        String regNo = user != null && user.getRegisterNumber() != null ? user.getRegisterNumber() : "21CS042";
        String dept = user != null && user.getDepartment() != null ? user.getDepartment() : "Computer Science & Engineering";

        String receiptId = "rec-" + System.currentTimeMillis();
        String recNo = "CC/REC/2026/" + String.format("%02d", semester) + "-" + (1000 + new Random().nextInt(9000));
        String token = "v_token_rec_" + System.currentTimeMillis() + "_signed_cc2026";

        FeeReceipt receipt = new FeeReceipt(
                receiptId,
                paymentId,
                recNo,
                token,
                "CampusConnect Institute of Technology",
                studentName,
                regNo,
                dept,
                semester,
                amountToPay,
                LocalDate.now().format(DateTimeFormatter.ofPattern("MMMM d, yyyy")),
                mode != null ? mode : "Online",
                ref,
                "Semester " + semester + " Composite Fee Paid in Full"
        );
        feeReceiptRepository.save(receipt);

        // Clear Accounts department in any active No-Dues requests
        clearAccountsStage(studentId);

        return Map.of(
                "success", true,
                "payment", payment,
                "receipt", receipt
        );
    }

    private void clearAccountsStage(String studentId) {
        List<StudentRequest> requests = requestRepository.findByStudentIdOrderByCreatedAtDesc(studentId);
        String today = LocalDate.now().toString();
        for (StudentRequest r : requests) {
            if ("No-dues".equalsIgnoreCase(r.getType())) {
                List<RequestDeptStage> stages = deptStageRepository.findByRequestIdOrderByIdAsc(r.getId());
                for (RequestDeptStage s : stages) {
                    if ("Accounts".equalsIgnoreCase(s.getDepartment()) && !s.isCleared()) {
                        s.setCleared(true);
                        s.setClearedAt(today);
                        s.setRemarks("Official college fees settled in full. Accounts department cleared.");
                        deptStageRepository.save(s);
                    }
                }
            }
        }
    }
}
