package com.campusconnect.dto;

import jakarta.validation.constraints.NotBlank;

public record RegisterSendCodeRequest(
        @NotBlank String registerNumber
) {}
