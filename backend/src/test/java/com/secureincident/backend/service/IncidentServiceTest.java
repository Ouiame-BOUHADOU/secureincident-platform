
package com.secureincident.backend.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.context.annotation.Import;

import com.secureincident.backend.entity.AppUser;
import com.secureincident.backend.entity.Incident;
import com.secureincident.backend.enums.IncidentCategory;
import com.secureincident.backend.enums.IncidentPriority;
import com.secureincident.backend.enums.IncidentStatus;
import com.secureincident.backend.enums.UserRole;
import com.secureincident.backend.repository.AppUserRepository;
import com.secureincident.backend.repository.IncidentRepository;

@DataJpaTest
@Import(IncidentService.class)
class IncidentServiceTest {

    @Autowired
    private IncidentService incidentService;

    @Autowired
    private AppUserRepository appUserRepository;

    @Autowired
    private IncidentRepository incidentRepository;

    // Helper method to create test users
    private AppUser createUser(String email, UserRole role) {

        AppUser user = new AppUser();

        user.setFullName("Test User");
        user.setEmail(email);
        user.setPasswordHash("test-hash");
        user.setRole(role);

        return appUserRepository.save(user);
    }

    @Test
    void employeeShouldCreateIncident() {

        AppUser employee =
                createUser("employee1@test.com", UserRole.EMPLOYEE);

        Incident incident = incidentService.createIncident(
                "Network failure",
                "The office network is unavailable.",
                IncidentCategory.NETWORK,
                IncidentPriority.HIGH,
                employee
        );

        assertThat(incident.getId()).isNotNull();
        assertThat(incident.getStatus()).isEqualTo(IncidentStatus.OPEN);
        assertThat(incident.getCreatedBy().getId())
                .isEqualTo(employee.getId());
    }

    @Test
    void adminShouldAssignIncidentToTechnician() {

        AppUser employee =
                createUser("employee2@test.com", UserRole.EMPLOYEE);

        AppUser admin =
                createUser("admin@test.com", UserRole.ADMIN);

        AppUser technician =
                createUser("tech1@test.com", UserRole.TECHNICIAN);

        Incident incident = incidentService.createIncident(
                "Server failure",
                "The server is unavailable.",
                IncidentCategory.NETWORK,
                IncidentPriority.CRITICAL,
                employee
        );

        Incident assigned = incidentService.assignIncident(
                incident.getId(),
                technician.getId(),
                admin
        );

        assertThat(assigned.getStatus())
                .isEqualTo(IncidentStatus.ASSIGNED);

        assertThat(assigned.getAssignedTo().getId())
                .isEqualTo(technician.getId());
    }

    @Test
    void employeeShouldNotAssignIncident() {

        AppUser employee =
                createUser("employee3@test.com", UserRole.EMPLOYEE);

        AppUser technician =
                createUser("tech2@test.com", UserRole.TECHNICIAN);

        Incident incident = incidentService.createIncident(
                "Software issue",
                "Application is not responding.",
                IncidentCategory.SOFTWARE,
                IncidentPriority.MEDIUM,
                employee
        );

        assertThatThrownBy(() ->
                incidentService.assignIncident(
                        incident.getId(),
                        technician.getId(),
                        employee
                )
        ).isInstanceOf(SecurityException.class);
    }

    @Test
    void unassignedTechnicianShouldNotUpdateIncident() {

        AppUser employee =
                createUser("employee4@test.com", UserRole.EMPLOYEE);

        AppUser technician =
                createUser("tech3@test.com", UserRole.TECHNICIAN);

        Incident incident = incidentService.createIncident(
                "Phishing attempt",
                "Suspicious email received.",
                IncidentCategory.PHISHING,
                IncidentPriority.HIGH,
                employee
        );

        assertThatThrownBy(() ->
                incidentService.updateStatus(
                        incident.getId(),
                        IncidentStatus.IN_PROGRESS,
                        technician
                )
        ).isInstanceOf(SecurityException.class);
    }

    @Test
    void technicianShouldNotUpdateAnotherTechniciansIncident() {

        AppUser employee =
                createUser("employee5@test.com", UserRole.EMPLOYEE);

        AppUser admin =
                createUser("admin2@test.com", UserRole.ADMIN);

        AppUser technician1 =
                createUser("tech4@test.com", UserRole.TECHNICIAN);

        AppUser technician2 =
                createUser("tech5@test.com", UserRole.TECHNICIAN);

        Incident incident = incidentService.createIncident(
                "Malware detection",
                "Suspicious activity detected.",
                IncidentCategory.MALWARE,
                IncidentPriority.CRITICAL,
                employee
        );

        incidentService.assignIncident(
                incident.getId(),
                technician1.getId(),
                admin
        );

        assertThatThrownBy(() ->
                incidentService.updateStatus(
                        incident.getId(),
                        IncidentStatus.IN_PROGRESS,
                        technician2
                )
        ).isInstanceOf(SecurityException.class);
    }
}
