package com.campusconnect.dto;

public record StudentDetailsDto(
        String registerNumber,
        String name,
        String department,
        int semester
) {}
