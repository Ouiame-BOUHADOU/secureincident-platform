
package com.secureincident.backend.dto;

import java.time.LocalDateTime;

import com.secureincident.backend.entity.AppUser;
import com.secureincident.backend.enums.UserRole;

public class UserResponse {

    private Long id;
    private String fullName;
    private String email;
    private UserRole role;
    private boolean enabled;
    private LocalDateTime createdAt;

    public UserResponse(
            Long id,
            String fullName,
            String email,
            UserRole role,
            boolean enabled,
            LocalDateTime createdAt) {

        this.id = id;
        this.fullName = fullName;
        this.email = email;
        this.role = role;
        this.enabled = enabled;
        this.createdAt = createdAt;
    }

    public static UserResponse fromEntity(AppUser user) {
        return new UserResponse(
            user.getId(),
            user.getFullName(),
            user.getEmail(),
            user.getRole(),
            user.isEnabled(),
            user.getCreatedAt()
        );
    }

    public Long getId() {
        return id;
    }

    public String getFullName() {
        return fullName;
    }

    public String getEmail() {
        return email;
    }

    public UserRole getRole() {
        return role;
    }

    public boolean isEnabled() {
        return enabled;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
