package com.secureincident.backend.dto;

import java.time.LocalDateTime;

public record IncidentHistoryResponse(
        Long id,
        String action,
        String details,
        String performedBy,
        LocalDateTime createdAt
) {}