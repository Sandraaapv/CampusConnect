package com.campusconnect.controller;

import com.campusconnect.dto.FeeStatusSummaryDto;
import com.campusconnect.model.FeePayment;
import com.campusconnect.model.FeeReceipt;
import com.campusconnect.service.FeeService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/fees")
public class FeeController {

    private final FeeService feeService;

    public FeeController(FeeService feeService) {
        this.feeService = feeService;
    }

    @GetMapping
    public ResponseEntity<FeeStatusSummaryDto> getFees(
            Authentication authentication,
            @RequestParam(required = false) Integer semester) {
        String studentId = (String) authentication.getPrincipal();
        return ResponseEntity.ok(feeService.getFeeStatusSummary(studentId, semester));
    }

    @GetMapping("/payments")
    public ResponseEntity<List<FeePayment>> getFeePayments(
            Authentication authentication,
            @RequestParam(required = false) Integer semester) {
        String studentId = (String) authentication.getPrincipal();
        return ResponseEntity.ok(feeService.getFeePayments(studentId, semester));
    }

    @GetMapping("/receipts/{id}")
    public ResponseEntity<FeeReceipt> getReceipt(
            Authentication authentication,
            @PathVariable String id) {
        String studentId = (String) authentication.getPrincipal();
        FeeReceipt receipt = feeService.getReceiptById(studentId, id);
        if (receipt == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(receipt);
    }

    @GetMapping("/receipts/verify/{token}")
    public ResponseEntity<Map<String, Object>> verifyReceipt(@PathVariable String token) {
        return ResponseEntity.ok(feeService.verifyReceiptToken(token));
    }

    public static class PayFeeRequest {
        public int semester;
        public String mode;
        public String idempotencyKey;
        public String cardNumber;
    }

    @PostMapping("/pay")
    public ResponseEntity<Map<String, Object>> payFees(
            Authentication authentication,
            @RequestBody PayFeeRequest req) {
        String studentId = (String) authentication.getPrincipal();
        Map<String, Object> result = feeService.payFees(
                studentId, req.semester, req.mode, req.idempotencyKey, req.cardNumber
        );
        return ResponseEntity.ok(result);
    }
}
