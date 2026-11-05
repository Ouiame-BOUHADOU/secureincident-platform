
package com.secureincident.backend.controller;

import com.secureincident.backend.dto.AuthResponse;
import com.secureincident.backend.dto.LoginRequest;
import com.secureincident.backend.dto.RegisterRequest;
import com.secureincident.backend.dto.UserResponse;
import com.secureincident.backend.repository.AppUserRepository;
import com.secureincident.backend.security.JwtService;
import com.secureincident.backend.service.AppUserService;

import io.jsonwebtoken.Jwts;
import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.bind.annotation.*;

import java.util.Locale;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import com.secureincident.backend.dto.AuthResponse;
import com.secureincident.backend.dto.LoginRequest;
import com.secureincident.backend.entity.AppUser;
import com.secureincident.backend.repository.AppUserRepository;
import com.secureincident.backend.security.JwtService;

@RestController 
@RequestMapping ("/api/auth")
public class AuthController {

    private final AppUserService appUserService;
    private final AuthenticationManager authenticationManager;
    private final AppUserRepository appUserRepository;
    private final JwtService jwtService;

    public AuthController(AppUserService appUserService, AuthenticationManager authenticationManager,
        AppUserRepository appUserRepository, JwtService jwtService
    ){
        this.appUserService = appUserService;
        this.authenticationManager = authenticationManager;
        this.appUserRepository = appUserRepository;
        this.jwtService = jwtService;
    }

    @PostMapping ("/register")
    public ResponseEntity<UserResponse> register(@Valid @RequestBody RegisterRequest request){
        UserResponse response =  appUserService.registerUser(
            request.getFullName(), request.getEmail(), request.getPassword());

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping ("/login")
    public ResponseEntity<AuthResponse> login(
        @Valid @RequestBody LoginRequest request
    ){
        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(
                request.getEmail().trim().toLowerCase(Locale.ROOT), 
                request.getPassword())
        );

        String email = authentication.getName();

        AppUser user =  appUserRepository.findByEmail(email)
            .orElseThrow(()-> new UsernameNotFoundException("User not found"));

        String token = jwtService.generateToken(user);
        

        AuthResponse response = new AuthResponse(token,jwtService.getExpirationSeconds(),UserResponse.fromEntity(user));

        return ResponseEntity.ok(response);
    }

}
