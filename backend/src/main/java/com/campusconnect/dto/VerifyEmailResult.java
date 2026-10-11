package com.campusconnect.dto;

import com.campusconnect.model.User;

public record VerifyEmailResult(
        boolean success,
        String message,
        String accessToken,
        String rawRefreshToken,
        User user
) {}
