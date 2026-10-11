package com.campusconnect.dto;

import jakarta.validation.constraints.NotBlank;

public record VerifyEmailRequest(
        @NotBlank String identifier,
        @NotBlank String otp
) {}
