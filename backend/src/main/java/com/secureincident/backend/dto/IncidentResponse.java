
package com.secureincident.backend.dto;

import java.time.LocalDateTime;

import com.secureincident.backend.entity.Incident;
import com.secureincident.backend.enums.IncidentCategory;
import com.secureincident.backend.enums.IncidentPriority;
import com.secureincident.backend.enums.IncidentStatus;

public class IncidentResponse {

    private Long id;
    private String title;
    private String description;
    private IncidentCategory category;
    private IncidentPriority priority;
    private IncidentStatus status;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    private Long creatorId;
    private String creatorName;

    private Long assignedTechnicianId;
    private String assignedTechnicianName;

    public IncidentResponse(
            Long id,
            String title,
            String description,
            IncidentCategory category,
            IncidentPriority priority,
            IncidentStatus status,
            LocalDateTime createdAt,
            LocalDateTime updatedAt,
            Long creatorId,
            String creatorName,
            Long assignedTechnicianId,
            String assignedTechnicianName) {

        this.id = id;
        this.title = title;
        this.description = description;
        this.category = category;
        this.priority = priority;
        this.status = status;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.creatorId = creatorId;
        this.creatorName = creatorName;
        this.assignedTechnicianId = assignedTechnicianId;
        this.assignedTechnicianName = assignedTechnicianName;
    }

    public static IncidentResponse fromEntity(Incident incident) {

        return new IncidentResponse(
            incident.getId(),
            incident.getTitle(),
            incident.getDescription(),
            incident.getCategory(),
            incident.getPriority(),
            incident.getStatus(),
            incident.getCreatedAt(),
            incident.getUpdatedAt(),

            incident.getCreatedBy().getId(),
            incident.getCreatedBy().getFullName(),

            incident.getAssignedTo() != null
                ? incident.getAssignedTo().getId()
                : null,

            incident.getAssignedTo() != null
                ? incident.getAssignedTo().getFullName()
                : null
        );
    }

    public Long getId() { return id; }
    public String getTitle() { return title; }
    public String getDescription() { return description; }
    public IncidentCategory getCategory() { return category; }
    public IncidentPriority getPriority() { return priority; }
    public IncidentStatus getStatus() { return status; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public Long getCreatorId() { return creatorId; }
    public String getCreatorName() { return creatorName; }
    public Long getAssignedTechnicianId() { return assignedTechnicianId; }
    public String getAssignedTechnicianName() { return assignedTechnicianName; }
}
