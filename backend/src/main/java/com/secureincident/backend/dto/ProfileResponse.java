
package com.secureincident.backend.dto;

import java.time.LocalDateTime;

import com.secureincident.backend.enums.UserRole;

public record ProfileResponse(
    Long id,
    String fullName,
    String email,
    UserRole role,
    boolean enabled,
    LocalDateTime createdAt
) {}
