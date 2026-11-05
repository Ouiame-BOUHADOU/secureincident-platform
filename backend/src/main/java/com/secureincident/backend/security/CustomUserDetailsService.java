package com.secureincident.backend.security;

import java.util.Locale;

import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.secureincident.backend.entity.AppUser;
import com.secureincident.backend.repository.AppUserRepository;

@Service 
public class CustomUserDetailsService implements UserDetailsService {
    


    private final AppUserRepository appUserRepository;

    public CustomUserDetailsService(AppUserRepository appUserRepository){
        this.appUserRepository = appUserRepository;
    }

    @Override 
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException{
        String normalizedEmail = email.trim().toLowerCase(Locale.ROOT);
        AppUser appUser =  appUserRepository.findByEmail(normalizedEmail)
            .orElseThrow(() ->
                        new UsernameNotFoundException("Invalid email or password"));
        
        return User.withUsername(appUser.getEmail())
            .password(appUser.getPasswordHash())
            .roles(appUser.getRole().name())
            .disabled(!appUser.isEnabled())
            .build();
    }

}
