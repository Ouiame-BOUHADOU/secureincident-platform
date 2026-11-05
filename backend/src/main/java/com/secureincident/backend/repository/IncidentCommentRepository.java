package com.secureincident.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.secureincident.backend.entity.IncidentComment;

public interface IncidentCommentRepository
        extends JpaRepository<IncidentComment, Long> {

    List<IncidentComment> findByIncidentIdOrderByCreatedAtAsc(
            Long incidentId
    );
}