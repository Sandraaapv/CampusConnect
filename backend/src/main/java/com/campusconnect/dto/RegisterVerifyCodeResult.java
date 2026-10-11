package com.campusconnect.dto;

public record RegisterVerifyCodeResult(
        boolean success,
        String registrationToken,
        StudentDetailsDto student
) {}
