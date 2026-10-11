package com.campusconnect.dto;

import jakarta.validation.constraints.NotBlank;

public record RegisterVerifyCodeRequest(
        @NotBlank String registerNumber,
        @NotBlank String code
) {}
