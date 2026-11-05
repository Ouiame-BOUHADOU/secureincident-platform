package com.secureincident.backend.controller;

import com.secureincident.backend.dto.CreateTechnicianRequest;
import com.secureincident.backend.dto.UserResponse;
import com.secureincident.backend.entity.AppUser;
import com.secureincident.backend.service.AppUserService;
import com.secureincident.backend.service.CurrentUserService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final AppUserService appUserService;
    private final CurrentUserService currentUserService;

    public UserController(
            AppUserService appUserService,
            CurrentUserService currentUserService) {
        this.appUserService = appUserService;
        this.currentUserService = currentUserService;
    }

    @PostMapping("/technicians")
    public ResponseEntity<UserResponse> createTechnician(
            @Valid @RequestBody CreateTechnicianRequest request) {

        AppUser administrator = currentUserService.getCurrentUser();

        UserResponse response = appUserService.createTechnician(
                request.getFullName(),
                request.getEmail(),
                request.getPassword(),
                administrator
        );

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}