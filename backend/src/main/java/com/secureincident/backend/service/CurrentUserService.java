
package com.secureincident.backend.service;

import java.util.Locale;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.secureincident.backend.entity.AppUser;
import com.secureincident.backend.repository.AppUserRepository;

@Service
public class CurrentUserService {

    private final AppUserRepository appUserRepository;

    public CurrentUserService(AppUserRepository appUserRepository) {
        this.appUserRepository = appUserRepository;
    }

    @Transactional(readOnly = true)
    public AppUser getCurrentUser() {

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null
                || !authentication.isAuthenticated()
                || authentication.getPrincipal() == null
                || !(authentication.getPrincipal() instanceof
                        org.springframework.security.core.userdetails.UserDetails)) {
            throw new AuthenticationCredentialsNotFoundException(
                    "Authentication required");
        }

        String email = authentication.getName()
                .trim()
                .toLowerCase(Locale.ROOT);

        return appUserRepository.findByEmail(email)
                .filter(AppUser::isEnabled)
                .orElseThrow(() ->
                        new AuthenticationCredentialsNotFoundException(
                                "Authentication required"));
    }
}
