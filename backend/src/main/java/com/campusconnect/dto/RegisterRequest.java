package com.campusconnect.dto;

import jakarta.validation.constraints.NotBlank;

public record RegisterRequest(
        @NotBlank String name,
        @NotBlank String registerNumber,
        @NotBlank String email,
        String department,
        Integer semester,
        @NotBlank String password,
        String captchaId,
        String captchaAnswer,
        String role
) {}
