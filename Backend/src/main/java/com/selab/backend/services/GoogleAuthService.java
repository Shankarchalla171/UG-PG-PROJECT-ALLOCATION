package com.selab.backend.services;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.selab.backend.auth.AuthenticationResponse;
import com.selab.backend.auth.JwtService;
import com.selab.backend.exceptions.AuthenticationFailedException;
import com.selab.backend.models.Role;
import com.selab.backend.models.Student;
import com.selab.backend.models.User;
import com.selab.backend.repositories.StudentRepository;
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
    private final StudentRepository studentRepository;
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
            throw new AuthenticationFailedException("Invalid Google token");
        }

        GoogleIdToken.Payload payload = idToken.getPayload();
        String email = payload.getEmail();

        // Check if user exists by email
        var existingUser = userRepository.findByEmail(email);

        User user;
        boolean isNewUser = false;

        if (existingUser.isPresent()) {
            // User exists - just login
            user = existingUser.get();
        } else {
            // Check if username exists (using email as username)
            if (userRepository.findByUsername(email).isPresent()) {
                throw new AuthenticationFailedException("Username already exists with this email");
            }

            // Create new user with USER role (automatically verified via Google)
            user = new User(
                    email, // username
                    email, // email
                    passwordEncoder.encode(UUID.randomUUID().toString()), // random password
                    Role.USER
            );

            userRepository.save(user);
            isNewUser = true;
            log.info("New user created via Google Sign-In: {}", email);
        }

        // Generate JWT token
        String jwtToken = jwtService.generateToken(user);

        // Get team info if student (same logic as normal authentication)
        UUID teamId = null;
        String teamRole = null;
        if (user.getRole() == Role.STUDENT) {
            Student student = studentRepository.findByUser(user)
                    .orElseThrow(() -> new RuntimeException("Student not found"));
            if (student.getTeamRole() != null) {
                teamId = student.getTeam().getTeamId();
                teamRole = student.getTeamRole().toString();
            }
        }

        String message = isNewUser ? "Registration successful with Google" : "Login successful";

        return AuthenticationResponse.builder()
                .token(jwtToken)
                .role(user.getRole().toString())
                .teamRole(teamRole)
                // You may also want to add teamId to AuthenticationResponse if needed
                // .teamId(teamId)
                .message(message)
                .build();
    }
}