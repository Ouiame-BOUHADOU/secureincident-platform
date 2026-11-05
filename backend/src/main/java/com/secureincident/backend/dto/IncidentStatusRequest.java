
package com.secureincident.backend.dto;

import com.secureincident.backend.enums.IncidentStatus;

import jakarta.validation.constraints.NotNull;

public class IncidentStatusRequest {

    @NotNull(message = "Incident status is required")
    private IncidentStatus status;

    public IncidentStatusRequest() {
    }

    public IncidentStatus getStatus() {
        return status;
    }

    public void setStatus(IncidentStatus status) {
        this.status = status;
    }
}
