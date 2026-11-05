package com.secureincident.backend.security;


import java.util.Date;

import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.secureincident.backend.entity.AppUser;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;

@Service 
public class JwtService {

    private final SecretKey signingKey;
    private final long expirationMs;

    public JwtService( @Value("${app.jwt.secret}") String secret, @Value("${app.jwt.expiration-ms}") long expirationMs){
        byte[] keyBytes = Decoders.BASE64.decode(secret);
        this.signingKey = Keys.hmacShaKeyFor(keyBytes);
        this.expirationMs = expirationMs;
    }

    public String generateToken(AppUser user){

        Date now = new Date();
        Date expiration = new Date(now.getTime()+expirationMs);

        return Jwts.builder()
            .subject(user.getEmail())
            .claim("role",user.getRole().name())
            .issuedAt(now)
            .expiration(expiration)
            .signWith(signingKey)
            .compact();
    }

    public Claims extractAllClaims(String token){
        return Jwts.parser()
        .verifyWith(signingKey)
        .build()
        .parseSignedClaims(token)
        .getPayload();
    }

    public String extractEmail(String token){
        return extractAllClaims(token).getSubject();
    }

    public boolean isTokenValid(String token, AppUser user){
        Claims claims = extractAllClaims(token);

        return claims.getSubject().equals(user.getEmail())
            && claims.getExpiration().after(new Date())
            && user.isEnabled();
    }
    public long getExpirationSeconds() {
        return expirationMs / 1000;
    }

    public boolean isTokenValidForUser(String token, org.springframework.security.core.userdetails.UserDetails userDetails){
        Claims claims = extractAllClaims(token);
        return claims.getSubject().equals(userDetails.getUsername())
            && claims.getExpiration().after(new Date())
            && userDetails.isEnabled();
    }

}
