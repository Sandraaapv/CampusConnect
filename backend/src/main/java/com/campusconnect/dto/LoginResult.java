package com.campusconnect.dto;

import com.campusconnect.model.User;

public record LoginResult(
        String accessToken,
        String rawRefreshToken,
        User user,
        boolean emailVerified,
        String message
) {}
