package com.secureincident.backend.dto;

import java.time.LocalDateTime;

public record IncidentCommentResponse(
        Long id,
        String content,
        String authorName,
        String authorEmail,
        LocalDateTime createdAt
) {}