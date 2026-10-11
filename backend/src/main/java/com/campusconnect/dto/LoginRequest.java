package com.campusconnect.dto;

import jakarta.validation.constraints.NotBlank;

public record LoginRequest(
        @NotBlank String identifier,
        @NotBlank String password,
        String captchaId,
        String captchaAnswer,
        boolean keepSignedIn,
        boolean isDemo
) {}
