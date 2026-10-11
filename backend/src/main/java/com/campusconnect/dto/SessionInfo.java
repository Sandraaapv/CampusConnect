package com.campusconnect.dto;

import java.time.LocalDateTime;

public record SessionInfo(
        String id,
        String device,
        String ip,
        LocalDateTime lastActiveAt,
        LocalDateTime createdAt
) {}
