package com.campusconnect.dto;

import java.time.LocalDateTime;

public record LoginEventDto(
        Long id,
        String ip,
        String device,
        boolean success,
        String reason,
        LocalDateTime at
) {}
