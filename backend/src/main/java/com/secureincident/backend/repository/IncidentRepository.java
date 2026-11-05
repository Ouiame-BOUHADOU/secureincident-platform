package com.secureincident.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.secureincident.backend.entity.Incident;
import com.secureincident.backend.enums.IncidentStatus;

public interface IncidentRepository extends JpaRepository<Incident, Long> {

    List<Incident> findByCreatedBy_Id(Long userId);

    List<Incident> findByAssignedTo_Id(Long technicianId);

    List<Incident> findByStatus(IncidentStatus status);

    List<Incident> findByCreatedBy_IdAndStatus(
            Long userId,
            IncidentStatus status
    );

    @Query("SELECT COUNT(i) FROM Incident i WHERE i.status = :status")
    long countIncidentsByStatus(@Param("status") IncidentStatus status);
}