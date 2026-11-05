package com.secureincident.backend.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public class IncidentAssignRequest {

    @NotNull(message = "Technician ID is required.")
    @Positive(message = "Technician ID must be positive.")
    private Long technicianId;

    public Long getTechnicianId() {
        return technicianId;
    }

    public void setTechnicianId(Long technicianId) {
        this.technicianId = technicianId;
    }
}