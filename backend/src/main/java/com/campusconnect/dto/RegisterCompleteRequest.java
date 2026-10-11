package com.campusconnect.dto;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotBlank;

public record RegisterCompleteRequest(
        @NotBlank String registrationToken,
        @NotBlank String registerNumber,
        @NotBlank String password,
        @AssertTrue(message = "You must accept the terms of service and privacy notice.") boolean termsAccepted,
        String role // Ignored if sent by client
) {}
