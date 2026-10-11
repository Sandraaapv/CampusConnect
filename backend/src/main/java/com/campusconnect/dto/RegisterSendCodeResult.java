package com.campusconnect.dto;

public record RegisterSendCodeResult(
        String message,
        String maskedEmail
) {}
