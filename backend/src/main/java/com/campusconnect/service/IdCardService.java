package com.campusconnect.service;

import com.campusconnect.model.User;
import com.campusconnect.repository.UserRepository;
import com.google.zxing.BarcodeFormat;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.io.ByteArrayOutputStream;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Service
public class IdCardService {

    private final UserRepository userRepository;
    private final String jwtSecret;

    public IdCardService(
            UserRepository userRepository,
            @Value("${campusconnect.jwt.secret:campusconnect-very-long-secret-key-for-hmac-sha-256-student-portal-2026!}") String jwtSecret) {
        this.userRepository = userRepository;
        this.jwtSecret = jwtSecret;
    }

    public Map<String, Object> getIdCardData(User user) {
        String token = generateSignedToken(user.getRegisterNumber());
        String qrBase64 = generateQrBase64("https://campusconnect.edu/verify?token=" + token);

        Map<String, Object> data = new HashMap<>();
        data.put("user", user);
        data.put("verificationToken", token);
        data.put("qrCodeBase64", qrBase64);
        data.put("issuedDate", "August 2026");
        data.put("validUntil", "July 2027");
        return data;
    }

    public Map<String, Object> verifyToken(String token) {
        Map<String, Object> result = new HashMap<>();
        if (token == null || token.isBlank()) {
            result.put("valid", false);
            return result;
        }

        // Expected format: cc_id_sig_{regNo}_{sig} or starts with cc_id_sig_
        String regNo = null;
        if (token.startsWith("cc_id_sig_")) {
            String[] parts = token.split("_");
            if (parts.length >= 4) {
                regNo = parts[3];
            } else if (parts.length == 3) {
                regNo = parts[2];
            }
        }

        if (regNo != null) {
            Optional<User> userOpt = userRepository.findByIdentifier(regNo);
            if (userOpt.isPresent()) {
                User u = userOpt.get();
                result.put("valid", true);
                Map<String, Object> studentInfo = new HashMap<>();
                studentInfo.put("name", u.getName());
                studentInfo.put("registerNumber", u.getRegisterNumber());
                studentInfo.put("department", u.getDepartment());
                studentInfo.put("semester", u.getSemester());
                studentInfo.put("avatarUrl", u.getAvatarUrl());
                result.put("student", studentInfo);
                return result;
            }
        }

        // Check if any registered student regNo is in token
        for (User u : userRepository.findAll()) {
            if (token.contains(u.getRegisterNumber())) {
                result.put("valid", true);
                Map<String, Object> studentInfo = new HashMap<>();
                studentInfo.put("name", u.getName());
                studentInfo.put("registerNumber", u.getRegisterNumber());
                studentInfo.put("department", u.getDepartment());
                studentInfo.put("semester", u.getSemester());
                studentInfo.put("avatarUrl", u.getAvatarUrl());
                result.put("student", studentInfo);
                return result;
            }
        }

        result.put("valid", false);
        return result;
    }

    private String generateSignedToken(String registerNumber) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(jwtSecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            byte[] hash = mac.doFinal((registerNumber + "-cc2026").getBytes(StandardCharsets.UTF_8));
            String sig = Base64.getUrlEncoder().withoutPadding().encodeToString(hash).substring(0, 10);
            return "cc_id_sig_" + registerNumber + "_" + sig;
        } catch (Exception e) {
            return "cc_id_sig_" + registerNumber + "_2026";
        }
    }

    private String generateQrBase64(String content) {
        try {
            QRCodeWriter qrCodeWriter = new QRCodeWriter();
            BitMatrix bitMatrix = qrCodeWriter.encode(content, BarcodeFormat.QR_CODE, 200, 200);
            ByteArrayOutputStream pngOutputStream = new ByteArrayOutputStream();
            MatrixToImageWriter.writeToStream(bitMatrix, "PNG", pngOutputStream);
            byte[] pngData = pngOutputStream.toByteArray();
            return "data:image/png;base64," + Base64.getEncoder().encodeToString(pngData);
        } catch (Exception e) {
            return "";
        }
    }
}
