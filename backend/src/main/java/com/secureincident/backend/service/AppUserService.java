package com.secureincident.backend.service;

import java.util.Locale;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.secureincident.backend.dto.UserResponse;
import com.secureincident.backend.entity.AppUser;
import com.secureincident.backend.enums.UserRole;
import com.secureincident.backend.repository.AppUserRepository;
import com.secureincident.backend.repository.IncidentRepository;
import com.secureincident.backend.dto.ProfileResponse;
import com.secureincident.backend.dto.ProfileUpdateRequest;

import com.secureincident.backend.dto.ChangePasswordRequest;

import com.secureincident.backend.dto.AdminStatisticsResponse;
import com.secureincident.backend.enums.IncidentStatus;


@Service
public class AppUserService {
    private final AppUserRepository appUserRepository;
    private final PasswordEncoder passwordEncoder;
    private final IncidentRepository incidentRepository;

    public AppUserService(
            AppUserRepository appUserRepository,
            PasswordEncoder passwordEncoder,
            IncidentRepository incidentRepository) {

        this.appUserRepository = appUserRepository;
        this.passwordEncoder = passwordEncoder;
        this.incidentRepository = incidentRepository;
    }
    @Transactional
    public UserResponse registerUser(
            String fullName,
            String email,
            String rawPassword) {

        String normalizedEmail = email.trim().toLowerCase(Locale.ROOT);

        if (appUserRepository.existsByEmail(normalizedEmail)) {
            throw new IllegalArgumentException(
                "An account with this email already exists."
            );
        }

        AppUser user = new AppUser();
        user.setFullName(fullName.trim());
        user.setEmail(normalizedEmail);
        user.setPasswordHash(passwordEncoder.encode(rawPassword));
        user.setRole(UserRole.EMPLOYEE);

        AppUser savedUser = appUserRepository.save(user);

        return UserResponse.fromEntity(savedUser);
    }

    @Transactional
    public UserResponse createTechnician(
            String fullName,
            String email,
            String rawPassword,
            AppUser administrator) {

        if (administrator.getRole() != UserRole.ADMIN) {
            throw new SecurityException(
                    "Only administrators can create technician accounts."
            );
        }

        String normalizedEmail = email.trim().toLowerCase(Locale.ROOT);

        if (appUserRepository.existsByEmail(normalizedEmail)) {
            throw new IllegalArgumentException("Email already exists.");
        }

        AppUser technician = new AppUser();

        technician.setFullName(fullName.trim());
        technician.setEmail(normalizedEmail);
        technician.setPasswordHash(passwordEncoder.encode(rawPassword));
        technician.setRole(UserRole.TECHNICIAN);

        AppUser savedTechnician = appUserRepository.save(technician);

        return UserResponse.fromEntity(savedTechnician);
    }

    @Transactional(readOnly = true)
    public ProfileResponse getProfile(AppUser currentUser) {

        return new ProfileResponse(
                currentUser.getId(),
                currentUser.getFullName(),
                currentUser.getEmail(),
                currentUser.getRole(),
                currentUser.isEnabled(),
                currentUser.getCreatedAt()
        );
    }

    @Transactional
    public ProfileResponse updateProfile(
            AppUser currentUser,
            ProfileUpdateRequest request) {

        String normalizedEmail =
                request.email().trim().toLowerCase(Locale.ROOT);

        if (appUserRepository.existsByEmailAndIdNot(
                normalizedEmail, currentUser.getId())) {

            throw new IllegalArgumentException(
                    "An account with this email already exists."
            );
        }

        currentUser.setFullName(request.fullName().trim());
        currentUser.setEmail(normalizedEmail);

        AppUser updatedUser = appUserRepository.save(currentUser);

        return new ProfileResponse(
                updatedUser.getId(),
                updatedUser.getFullName(),
                updatedUser.getEmail(),
                updatedUser.getRole(),
                updatedUser.isEnabled(),
                updatedUser.getCreatedAt()
        );
    }

    @Transactional
    public void changePassword(
            AppUser currentUser,
            ChangePasswordRequest request) {

        // 1. Verify the current password
        if (!passwordEncoder.matches(
                request.oldPassword(),
                currentUser.getPasswordHash())) {

            throw new IllegalArgumentException(
                    "Current password is incorrect."
            );
        }

        // 2. Verify the new password confirmation
        if (!request.newPassword().equals(request.confirmNewPassword())) {

            throw new IllegalArgumentException(
                    "New password confirmation does not match."
            );
        }

        // 3. Prevent reusing the current password
        if (passwordEncoder.matches(
                request.newPassword(),
                currentUser.getPasswordHash())) {

            throw new IllegalArgumentException(
                    "New password must be different from the current password."
            );
        }

        // 4. Hash and save the new password
        currentUser.setPasswordHash(
                passwordEncoder.encode(request.newPassword())
        );

        appUserRepository.save(currentUser);
    }
    @Transactional(readOnly = true)
    public java.util.List<UserResponse> getAllUsers(AppUser administrator) {

        if (administrator.getRole() != UserRole.ADMIN) {
            throw new SecurityException(
                    "Only administrators can view all users."
            );
        }

        return appUserRepository.findAll()
                .stream()
                .map(UserResponse::fromEntity)
                .toList();
    }
    @Transactional
    public UserResponse enableUser(Long userId, AppUser administrator) {

        if (administrator.getRole() != UserRole.ADMIN) {
            throw new SecurityException(
                    "Only administrators can enable user accounts."
            );
        }

        AppUser user = appUserRepository.findById(userId)
                .orElseThrow(() ->
                        new IllegalArgumentException("User not found."));

        if (user.isEnabled()) {
        throw new IllegalStateException(
                "This account is already enabled."
        );
        }
        user.setEnabled(true);

        AppUser updatedUser = appUserRepository.save(user);

        return UserResponse.fromEntity(updatedUser);
    }
    @Transactional
    public UserResponse disableUser(Long userId, AppUser administrator) {

        if (administrator.getRole() != UserRole.ADMIN) {
            throw new SecurityException(
                    "Only administrators can disable user accounts."
            );
        }

        if (administrator.getId().equals(userId)) {
            throw new IllegalArgumentException(
                    "An administrator cannot disable their own account."
            );
        }

        AppUser user = appUserRepository.findById(userId)
                .orElseThrow(() ->
                        new IllegalArgumentException("User not found."));

        if (!user.isEnabled()) {
        throw new IllegalStateException(
                "This account is already disabled."
        );
        }
        user.setEnabled(false);

        AppUser updatedUser = appUserRepository.save(user);

        return UserResponse.fromEntity(updatedUser);
    }

    @Transactional(readOnly = true)
    public AdminStatisticsResponse getAdminStatistics(
            AppUser administrator) {

        if (administrator.getRole() != UserRole.ADMIN) {
            throw new SecurityException(
                    "Only administrators can view statistics."
            );
        }

        long totalUsers = appUserRepository.count();

        long employees =
                appUserRepository.countByRole(UserRole.EMPLOYEE);

        long technicians =
                appUserRepository.countByRole(UserRole.TECHNICIAN);

        long totalIncidents = incidentRepository.count();

        long openIncidents =
                incidentRepository.countIncidentsByStatus(IncidentStatus.OPEN);

        long inProgressIncidents =
                incidentRepository.countIncidentsByStatus(IncidentStatus.IN_PROGRESS);

        long closedIncidents =
                incidentRepository.countIncidentsByStatus(IncidentStatus.CLOSED);
        
        long resolvedIncidents =
                incidentRepository.countIncidentsByStatus(IncidentStatus.RESOLVED);

                return new AdminStatisticsResponse(
                        totalUsers,
                        employees,
                        technicians,
                        totalIncidents,
                        openIncidents,
                        inProgressIncidents,
                        resolvedIncidents,
                        closedIncidents
                );
            }



}
