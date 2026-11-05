package com.secureincident.backend.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.secureincident.backend.dto.UserResponse;
import com.secureincident.backend.entity.AppUser;
import com.secureincident.backend.service.AppUserService;
import com.secureincident.backend.service.CurrentUserService;
import com.secureincident.backend.dto.AdminStatisticsResponse;

import jakarta.validation.Valid;

import com.secureincident.backend.dto.CreateTechnicianRequest;
@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final AppUserService appUserService;
    private final CurrentUserService currentUserService;

    public AdminController(
            AppUserService appUserService,
            CurrentUserService currentUserService) {

        this.appUserService = appUserService;
        this.currentUserService = currentUserService;
    }

    // List all users
    @GetMapping("/users")
    public ResponseEntity<List<UserResponse>> getAllUsers() {

        AppUser administrator = currentUserService.getCurrentUser();

        return ResponseEntity.ok(
                appUserService.getAllUsers(administrator)
        );
    }

    // Enable a user account
    @PutMapping("/users/{userId}/enable")
    public ResponseEntity<UserResponse> enableUser(
            @PathVariable Long userId) {

        AppUser administrator = currentUserService.getCurrentUser();

        return ResponseEntity.ok(
                appUserService.enableUser(userId, administrator)
        );
    }

    // Disable a user account
    @PutMapping("/users/{userId}/disable")
    public ResponseEntity<UserResponse> disableUser(
            @PathVariable Long userId) {

        AppUser administrator = currentUserService.getCurrentUser();

        return ResponseEntity.ok(
                appUserService.disableUser(userId, administrator)
        );
    }

    @GetMapping("/statistics")
    public ResponseEntity<AdminStatisticsResponse> getStatistics() {

        AppUser administrator = currentUserService.getCurrentUser();

        return ResponseEntity.ok(
                appUserService.getAdminStatistics(administrator)
        );
    }
    // Create a technician account
    @PostMapping("/technicians")
    public ResponseEntity<UserResponse> createTechnician(
            @Valid @RequestBody CreateTechnicianRequest request) {

        AppUser administrator = currentUserService.getCurrentUser();

        UserResponse technician = appUserService.createTechnician(
                request.getFullName(),
                request.getEmail(),
                request.getPassword(),
                administrator
        );

        return ResponseEntity.status(201).body(technician);
    }
}