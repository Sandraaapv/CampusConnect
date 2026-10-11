package com.campusconnect.dto;

public record TokenRefreshResult(
        String accessToken,
        String refreshToken
) {}
