package com.secureincident.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.secureincident.backend.entity.IncidentHistory;

public interface IncidentHistoryRepository
        extends JpaRepository<IncidentHistory, Long> {

    List<IncidentHistory> findByIncidentIdOrderByCreatedAtDesc(Long incidentId);
}