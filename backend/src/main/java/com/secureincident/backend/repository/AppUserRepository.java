package com.secureincident.backend.repository;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

import com.secureincident.backend.entity.AppUser;
import com.secureincident.backend.enums.UserRole;

public interface AppUserRepository extends JpaRepository<AppUser, Long>{
    Optional<AppUser> findByEmail(String email);
    
    boolean existsByEmail(String email);

    boolean existsByEmailAndIdNot(String email, Long id);
    
    long countByRole(UserRole role);

}
