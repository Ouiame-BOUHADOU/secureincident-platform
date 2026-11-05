package com.secureincident.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.secureincident.backend.dto.ProfileResponse;
import com.secureincident.backend.dto.ProfileUpdateRequest;
import com.secureincident.backend.entity.AppUser;
import com.secureincident.backend.service.AppUserService;
import com.secureincident.backend.service.CurrentUserService;

import com.secureincident.backend.dto.ChangePasswordRequest;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/profile")
public class ProfileController {

    private final AppUserService appUserService;
    private final CurrentUserService currentUserService;

    public ProfileController(
            AppUserService appUserService,
            CurrentUserService currentUserService) {

        this.appUserService = appUserService;
        this.currentUserService = currentUserService;
    }

    @GetMapping
    public ResponseEntity<ProfileResponse> getProfile() {

        AppUser currentUser = currentUserService.getCurrentUser();

        return ResponseEntity.ok(
                appUserService.getProfile(currentUser)
        );
    }

    @PutMapping
    public ResponseEntity<ProfileResponse> updateProfile(
            @Valid @RequestBody ProfileUpdateRequest request) {

        AppUser currentUser = currentUserService.getCurrentUser();

        return ResponseEntity.ok(
                appUserService.updateProfile(currentUser, request)
        );
    }

    @PutMapping("/password")
    public ResponseEntity<Void> changePassword(
            @Valid @RequestBody ChangePasswordRequest request) {

        AppUser currentUser = currentUserService.getCurrentUser();

        appUserService.changePassword(currentUser, request);

        return ResponseEntity.noContent().build();
    }
}