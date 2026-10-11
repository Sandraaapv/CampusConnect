package com.campusconnect.dto;

public record RegisterCompleteResult(
        boolean success,
        String message,
        String accessToken,
        UserDto user
) {}
