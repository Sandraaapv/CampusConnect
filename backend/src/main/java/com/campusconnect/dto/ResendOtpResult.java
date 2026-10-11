package com.campusconnect.dto;

public record ResendOtpResult(
        String maskedEmail,
        String message
) {}
