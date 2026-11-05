
package com.secureincident.backend.dto;

public class AuthResponse {

    private String accessToken;
    private String tokenType;
    private long expiresIn;

    private UserResponse user;

    public AuthResponse(
            String accessToken,
            long expiresIn,
            UserResponse user) {

        this.accessToken = accessToken;
        this.tokenType = "Bearer";
        this.expiresIn = expiresIn;
        this.user = user;
    }

    public String getAccessToken() {
        return accessToken;
    }

    public String getTokenType() {
        return tokenType;
    }

    public long getExpiresIn() {
        return expiresIn;
    }

    public UserResponse getUser() {
        return user;
    }
}
