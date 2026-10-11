package com.campusconnect.dto;

public record RegisterResult(
        String userId,
        String maskedEmail,
        String message
) {}
