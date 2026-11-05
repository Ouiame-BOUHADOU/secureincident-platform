package com.secureincident.backend.entity;

import java.time.LocalDateTime;

import com.secureincident.backend.enums.UserRole;

import jakarta.persistence.*;

@Entity 
@Table(name="users")
public class AppUser {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String fullName;

    @Column(nullable = false, unique = true, length = 150)
    private String email;

    @Column(nullable = false)
    private String passwordHash;

    @Enumerated (EnumType.STRING)
    @Column (nullable = false)
    private UserRole role;

    @Column (nullable = false)
    private boolean enabled = true;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
    createdAt = LocalDateTime.now();

}

public AppUser(){

}
public Long getId(){
    return id;
}

public String getFullName(){
    return fullName;
}

public void setFullName(String fullName){
    this.fullName = fullName;
}

public String getEmail(){
    return email;
}
public void setEmail(String email){
    this.email = email;
}
    public String getPasswordHash() {
        return passwordHash;
    }

    public void setPasswordHash(String passwordHash) {
        this.passwordHash = passwordHash;
    }

    public UserRole getRole() {
        return role;
    }

    public void setRole(UserRole role) {
        this.role = role;
    }

    public boolean isEnabled() {
        return enabled;
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}