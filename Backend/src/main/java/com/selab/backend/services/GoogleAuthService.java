// com/selab/backend/services/GoogleAuthService.java
package com.selab.backend.services;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.selab.backend.auth.AuthenticationResponse;
import com.selab.backend.auth.JwtService;
import com.selab.backend.models.User;
import com.selab.backend.models.Role;
import com.selab.backend.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.util.Collections;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class GoogleAuthService {

    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;

    @Value("${google.client-id}")
    private String googleClientId;

    @Transactional
    public AuthenticationResponse googleAuthenticate(String idTokenString) throws GeneralSecurityException, IOException {
        // Verify Google token
        GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(
                new NetHttpTransport(),
                GsonFactory.getDefaultInstance()
        )
                .setAudience(Collections.singletonList(googleClientId))
                .build();

        GoogleIdToken idToken = verifier.verify(idTokenString);

        if (idToken == null) {
            throw new RuntimeException("Invalid Google token");
        }

        GoogleIdToken.Payload payload = idToken.getPayload();
        String email = payload.getEmail();

        // Check if user exists by email
        var existingUser = userRepository.findByEmail(email);

        if (existingUser.isPresent()) {
            // User exists - just login
            User user = existingUser.get();

            // Generate JWT token
            String jwtToken = jwtService.generateToken(user);

            return AuthenticationResponse.builder()
                    .token(jwtToken)
                    .role(user.getRole().toString())
                    .message("Login successful")
                    .build();
        } else {
            // Check if username exists (using email as username)
            if (userRepository.findByUsername(email).isPresent()) {
                throw new RuntimeException("Username already exists with this email");
            }

            // Create new user with   role
            var user = new User(
                    email, // username
                    email, // email
                    passwordEncoder.encode(UUID.randomUUID().toString()), // random password
                    Role.USER
            );

            userRepository.save(user);

            log.info("New user created via Google Sign-In: {}", email);

            // Generate JWT token for new user
            String jwtToken = jwtService.generateToken(user);

            return AuthenticationResponse.builder()
                    .token(jwtToken)
                    .role(user.getRole().toString())
                    .message("Registration successful with Google")
                    .build();
        }
    }
}