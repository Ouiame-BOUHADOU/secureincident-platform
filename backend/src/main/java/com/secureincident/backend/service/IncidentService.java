package com.secureincident.backend.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.secureincident.backend.entity.AppUser;
import com.secureincident.backend.entity.Incident;
import com.secureincident.backend.enums.IncidentStatus;
import com.secureincident.backend.enums.UserRole;
import com.secureincident.backend.repository.AppUserRepository;
import com.secureincident.backend.repository.IncidentRepository;
import com.secureincident.backend.enums.IncidentCategory;
import com.secureincident.backend.enums.IncidentPriority;

import com.secureincident.backend.repository.IncidentHistoryRepository;
import com.secureincident.backend.entity.IncidentHistory;

import com.secureincident.backend.dto.IncidentHistoryResponse;

import com.secureincident.backend.entity.IncidentComment;
import com.secureincident.backend.repository.IncidentCommentRepository;
import com.secureincident.backend.dto.IncidentCommentResponse;

@Service 
public class IncidentService {
    private final IncidentRepository incidentRepository;
    private final AppUserRepository appUserRepository;
    private final IncidentHistoryRepository incidentHistoryRepository;
    private final IncidentCommentRepository incidentCommentRepository;
    
    public IncidentService(
            IncidentRepository incidentRepository,
            AppUserRepository appUserRepository,
            IncidentHistoryRepository incidentHistoryRepository,
            IncidentCommentRepository incidentCommentRepository) {

        this.incidentRepository = incidentRepository;
        this.appUserRepository = appUserRepository;
        this.incidentHistoryRepository = incidentHistoryRepository;
        this.incidentCommentRepository = incidentCommentRepository;
    }

    @Transactional 
    public Incident createIncident(String title, String description, IncidentCategory category, IncidentPriority priority, AppUser creator){

        if(creator.getRole() != UserRole.EMPLOYEE){
            throw new SecurityException(
                "Only employees can report incidents."
            );
        }

        Incident incident = new Incident();

        incident.setTitle(title);
        incident.setDescription(description);
        incident.setCategory(category);
        incident.setPriority(priority);
        incident.setStatus(IncidentStatus.OPEN);
        incident.setCreatedBy(creator);

        Incident savedIncident = incidentRepository.save(incident);

        recordHistory(
                savedIncident,
                creator,
                "CREATED",
                "Incident created by " + creator.getEmail()
        );

        return savedIncident;
    }

    @Transactional (readOnly = true)
    public List<Incident> getMyIncidents(AppUser employee){
        if(employee.getRole() != UserRole.EMPLOYEE){
            throw new SecurityException("Access denied.");
        }
        return incidentRepository.findByCreatedBy_Id(employee.getId());
    }

    @Transactional 
    public Incident assignIncident(Long incidentId, Long technicianId, AppUser administrator){

        if(administrator.getRole() != UserRole.ADMIN){
            throw new SecurityException("Only administrators can assign incidents.");
        }

        Incident incident = incidentRepository.findById(incidentId)
            .orElseThrow(() ->
                new IllegalArgumentException("Incident not found.")
            );

        AppUser technician = appUserRepository.findById(technicianId)
            .orElseThrow(() ->
                new IllegalArgumentException("Techniciannot found.")
            );

        if (technician.getRole() != UserRole.TECHNICIAN) {
        throw new IllegalArgumentException(
                "Technician not found."
        );
        }

        if (!technician.isEnabled()) {
        throw new IllegalStateException(
                "Cannot assign incidents to a disabled technician."
        );
        }

        if(incident.getStatus() != IncidentStatus.OPEN){
            throw new IllegalStateException("Only open incidents can be assigned.");
        }

       incident.setAssignedTo(technician);
        incident.setStatus(IncidentStatus.ASSIGNED);

        Incident savedIncident = incidentRepository.save(incident);

        recordHistory(
                savedIncident,
                administrator,
                "ASSIGNED",
                "Incident assigned to technician: " + technician.getEmail()
        );

        return savedIncident;
    }

    @Transactional 
    public Incident updateStatus(Long incidentId, IncidentStatus newStatus, AppUser actor){
        Incident incident = incidentRepository.findById(incidentId)
                .orElseThrow(() ->
                    new IllegalArgumentException("Incident not found."));
        boolean isAdmin = actor.getRole() == UserRole.ADMIN;
        
                boolean isAssignedTechnician =
                actor.getRole() == UserRole.TECHNICIAN
                && incident.getAssignedTo() != null
                && incident.getAssignedTo().getId().equals(actor.getId());

        if (!isAdmin && !isAssignedTechnician) {
            throw new SecurityException(
                    "You are not authorized to update this incident."
            );
        }

        if (isAssignedTechnician) {

        if (incident.getStatus() == IncidentStatus.ASSIGNED
                && newStatus != IncidentStatus.IN_PROGRESS) {

                throw new IllegalStateException(
                        "An assigned incident must first be marked in progress."
                );
        }

        if (incident.getStatus() == IncidentStatus.IN_PROGRESS
                && newStatus != IncidentStatus.RESOLVED) {

                throw new IllegalStateException(
                        "An incident in progress can only be marked as resolved."
                );
        }

        if (incident.getStatus() != IncidentStatus.ASSIGNED
                && incident.getStatus() != IncidentStatus.IN_PROGRESS) {

                throw new IllegalStateException(
                        "This incident cannot be modified by the technician."
                );
        }
        }

        if (isAdmin && newStatus != IncidentStatus.CLOSED) {
        throw new IllegalArgumentException(
                "Administrators can only close incidents through this operation."
        );
        }

        if (isAdmin
                && incident.getStatus() != IncidentStatus.RESOLVED) {

        throw new IllegalStateException(
                "Only resolved incidents can be closed."
        );
        }

        IncidentStatus oldStatus = incident.getStatus();

        incident.setStatus(newStatus);

        Incident savedIncident = incidentRepository.save(incident);

        recordHistory(
                savedIncident,
                actor,
                "STATUS_CHANGED",
                "Status changed from " + oldStatus + " to " + newStatus
        );

        return savedIncident;
    }
    @Transactional(readOnly = true)
    public List<Incident> getAllIncidents(AppUser administrator) {

        if (administrator.getRole() != UserRole.ADMIN) {
            throw new SecurityException(
                    "Only administrators can view all incidents."
            );
        }

        return incidentRepository.findAll();
    }

    private void recordHistory(
            Incident incident,
            AppUser performedBy,
            String action,
            String details) {

        IncidentHistory history = new IncidentHistory();

        history.setIncident(incident);
        history.setPerformedBy(performedBy);
        history.setAction(action);
        history.setDetails(details);

        incidentHistoryRepository.save(history);
    }

    @Transactional(readOnly = true)
    public List<IncidentHistoryResponse> getIncidentHistory(
            Long incidentId,
            AppUser actor) {

        Incident incident = incidentRepository.findById(incidentId)
                .orElseThrow(() ->
                        new IllegalArgumentException("Incident not found."));

        boolean isAdmin = actor.getRole() == UserRole.ADMIN;

        boolean isOwner =
                incident.getCreatedBy().getId().equals(actor.getId());

        boolean isAssignedTechnician =
                actor.getRole() == UserRole.TECHNICIAN
                && incident.getAssignedTo() != null
                && incident.getAssignedTo().getId().equals(actor.getId());

        if (!isAdmin && !isOwner && !isAssignedTechnician) {
            throw new SecurityException(
                    "You are not authorized to view this incident history."
            );
        }

        List<IncidentHistory> history =
                incidentHistoryRepository
                        .findByIncidentIdOrderByCreatedAtDesc(incidentId);

        return history.stream()
                .map(event -> new IncidentHistoryResponse(
                        event.getId(),
                        event.getAction(),
                        event.getDetails(),
                        event.getPerformedBy().getEmail(),
                        event.getCreatedAt()
                ))
                .toList();
    }

    @Transactional
    public IncidentCommentResponse addComment(
            Long incidentId,
            String content,
            AppUser author) {

        Incident incident = incidentRepository.findById(incidentId)
                .orElseThrow(() ->
                        new IllegalArgumentException("Incident not found."));

        boolean isAssignedTechnician =
                author.getRole() == UserRole.TECHNICIAN
                && incident.getAssignedTo() != null
                && incident.getAssignedTo().getId().equals(author.getId());

        if (incident.getStatus() != IncidentStatus.ASSIGNED
        && incident.getStatus() != IncidentStatus.IN_PROGRESS) {
        throw new IllegalStateException(
                "Comments can only be added to assigned or in-progress incidents."
        );
        }

        if (!isAssignedTechnician) {
            throw new SecurityException(
                    "Only the assigned technician can add comments."
            );
        }

        IncidentComment comment = new IncidentComment();

        comment.setIncident(incident);
        comment.setAuthor(author);
        comment.setContent(content.trim());

        IncidentComment savedComment =
                incidentCommentRepository.save(comment);

        return new IncidentCommentResponse(
                savedComment.getId(),
                savedComment.getContent(),
                author.getFullName(),
                author.getEmail(),
                savedComment.getCreatedAt()
        );
    }

    @Transactional(readOnly = true)
    public List<IncidentCommentResponse> getIncidentComments(
            Long incidentId,
            AppUser actor) {

        Incident incident = incidentRepository.findById(incidentId)
                .orElseThrow(() ->
                        new IllegalArgumentException("Incident not found."));

        boolean isAdmin = actor.getRole() == UserRole.ADMIN;

        boolean isOwner =
                incident.getCreatedBy().getId().equals(actor.getId());

        boolean isAssignedTechnician =
                actor.getRole() == UserRole.TECHNICIAN
                && incident.getAssignedTo() != null
                && incident.getAssignedTo().getId().equals(actor.getId());

        if (!isAdmin && !isOwner && !isAssignedTechnician) {
            throw new SecurityException(
                    "You are not authorized to view these comments."
            );
        }

        return incidentCommentRepository
                .findByIncidentIdOrderByCreatedAtAsc(incidentId)
                .stream()
                .map(comment -> new IncidentCommentResponse(
                        comment.getId(),
                        comment.getContent(),
                        comment.getAuthor().getFullName(),
                        comment.getAuthor().getEmail(),
                        comment.getCreatedAt()
                ))
                .toList();
    }
    
        @Transactional(readOnly = true)
        public Incident getIncidentById(Long incidentId, AppUser actor) {

        Incident incident = incidentRepository.findById(incidentId)
                .orElseThrow(() ->
                        new IllegalArgumentException("Incident not found."));

        boolean isAdmin = actor.getRole() == UserRole.ADMIN;

        boolean isOwner =
                incident.getCreatedBy().getId().equals(actor.getId());

        boolean isAssignedTechnician =
                actor.getRole() == UserRole.TECHNICIAN
                && incident.getAssignedTo() != null
                && incident.getAssignedTo().getId().equals(actor.getId());

        if (!isAdmin && !isOwner && !isAssignedTechnician) {
                throw new SecurityException(
                        "You are not authorized to view this incident."
                );
        }

        return incident;
        }

        @Transactional(readOnly = true)
        public List<Incident> getAssignedIncidents(AppUser technician) {

        if (technician.getRole() != UserRole.TECHNICIAN) {
                throw new SecurityException(
                        "Only technicians can view their assigned incidents."
                );
        }

        return incidentRepository.findByAssignedTo_Id(technician.getId());
        }


}
