package com.campusconnect.dto;

import jakarta.validation.constraints.NotBlank;

public record ResendOtpRequest(
        @NotBlank String identifier,
        @NotBlank String purpose
) {}
