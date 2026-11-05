package com.secureincident.backend.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;

import com.secureincident.backend.dto.IncidentCommentRequest;
import com.secureincident.backend.dto.IncidentCommentResponse;
import com.secureincident.backend.dto.IncidentCreateRequest;
import com.secureincident.backend.dto.IncidentHistoryResponse;
import com.secureincident.backend.dto.IncidentResponse;
import com.secureincident.backend.dto.IncidentStatusRequest;
import com.secureincident.backend.entity.AppUser;
import com.secureincident.backend.entity.Incident;
import com.secureincident.backend.service.CurrentUserService;
import com.secureincident.backend.service.IncidentService;

@RestController 
@RequestMapping ("/api/incidents")
public class IncidentController {
    private final CurrentUserService currentUserService;
    private final IncidentService incidentService;

    public IncidentController(
            CurrentUserService currentUserService,
            IncidentService incidentService) {
        this.currentUserService = currentUserService;
        this.incidentService = incidentService;
    }

    @GetMapping ("/my")
    public List<IncidentResponse> getMyIncidents(){
        AppUser currentUser = currentUserService.getCurrentUser();

        return incidentService.getMyIncidents(currentUser)
        .stream()
        .map(IncidentResponse::fromEntity)
        .toList();
    }
    @GetMapping("/assigned")
    public List<IncidentResponse> getAssignedIncidents() {

        AppUser currentUser = currentUserService.getCurrentUser();

        return incidentService.getAssignedIncidents(currentUser)
                .stream()
                .map(IncidentResponse::fromEntity)
                .toList();
    }
    @GetMapping("/{incidentId}")
    public ResponseEntity<IncidentResponse> getIncidentById(
            @PathVariable Long incidentId) {

        AppUser currentUser = currentUserService.getCurrentUser();

        Incident incident = incidentService.getIncidentById(
                incidentId,
                currentUser
        );

        return ResponseEntity.ok(IncidentResponse.fromEntity(incident));
    }

    @PostMapping
    public ResponseEntity<IncidentResponse> createIncident(
        @Valid @RequestBody IncidentCreateRequest request) {

        AppUser currentUser = currentUserService.getCurrentUser();

        Incident incident = incidentService.createIncident(
                request.getTitle(),
                request.getDescription(),
                request.getCategory(),
                request.getPriority(),
                currentUser
        );

        IncidentResponse response = IncidentResponse.fromEntity(incident);

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{incidentId}/assign/{technicianId}")
    public ResponseEntity<IncidentResponse> assignIncident(
            @PathVariable Long incidentId,
            @PathVariable Long technicianId) {

        AppUser currentUser = currentUserService.getCurrentUser();

        Incident incident = incidentService.assignIncident(
                incidentId,
                technicianId,
                currentUser
        );

        return ResponseEntity.ok(IncidentResponse.fromEntity(incident));
    }

    @PutMapping("/{incidentId}/status")
    public ResponseEntity<IncidentResponse> updateStatus(
            @PathVariable Long incidentId,
            @Valid @RequestBody IncidentStatusRequest request) {

        AppUser currentUser = currentUserService.getCurrentUser();

        Incident incident = incidentService.updateStatus(
                incidentId,
                request.getStatus(),
                currentUser
        );

        return ResponseEntity.ok(IncidentResponse.fromEntity(incident));
    }

    @GetMapping
    public List<IncidentResponse> getAllIncidents() {

        AppUser administrator = currentUserService.getCurrentUser();

        return incidentService.getAllIncidents(administrator)
                .stream()
                .map(IncidentResponse::fromEntity)
                .toList();
    }

    @GetMapping("/{incidentId}/history")
    public List<IncidentHistoryResponse> getIncidentHistory(
            @PathVariable Long incidentId) {

        AppUser currentUser = currentUserService.getCurrentUser();

        return incidentService.getIncidentHistory(
                incidentId,
                currentUser
        );
    }
    @PostMapping("/{incidentId}/comments")
    public ResponseEntity<IncidentCommentResponse> addComment(
            @PathVariable Long incidentId,
            @Valid @RequestBody IncidentCommentRequest request) {

        AppUser currentUser = currentUserService.getCurrentUser();

        IncidentCommentResponse response = incidentService.addComment(
                incidentId,
                request.content(),
                currentUser
        );

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
    @GetMapping("/{incidentId}/comments")
    public List<IncidentCommentResponse> getIncidentComments(
            @PathVariable Long incidentId) {

        AppUser currentUser = currentUserService.getCurrentUser();

        return incidentService.getIncidentComments(
                incidentId,
                currentUser
        );
    }
    

}
