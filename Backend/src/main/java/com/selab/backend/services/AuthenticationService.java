package com.selab.backend.services;

import com.selab.backend.auth.AuthenticationRequest;
import com.selab.backend.auth.AuthenticationResponse;
import com.selab.backend.auth.JwtService;
import com.selab.backend.auth.RegisterRequest;
import com.selab.backend.models.Role;
import com.selab.backend.models.User;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import com.selab.backend.repositories.UserRepository;
import com.selab.backend.services.EmailService;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor

public class AuthenticationService
{
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final EmailService emailService;


    @Transactional
    public AuthenticationResponse register(RegisterRequest registerRequest) {
        // Check if user already exists
        if (userRepository.findByUsername(registerRequest.getUsername()).isPresent()) {
            throw new RuntimeException("Username already exists");
        }
        if (userRepository.findByEmail(registerRequest.getEmail()).isPresent()) {
            throw new RuntimeException("Email already exists");
        }

        var user = new User(
                registerRequest.getUsername(),
                registerRequest.getEmail(),
                passwordEncoder.encode(registerRequest.getPassword()),
                Role.UNVERIFIED
        );

        userRepository.save(user);

        // Generate verification token
        var verificationToken = generateVerificationToken(user);

        // Send verification email
        emailService.sendVerificationEmail(
                user.getEmail(),
                user.getUsername(),
                verificationToken
        );

        return AuthenticationResponse.builder()
                .message("Registration successful! Please verify your email to activate your account.")
                .build();
    }

    private String generateVerificationToken(User user) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("purpose", "email_verification");
        return jwtService.generateToken(claims, user);
    }
    public  AuthenticationResponse authenticate(AuthenticationRequest request){
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getUsername(),
                        request.getPassword()

                        )
        );

        var user=userRepository.findByUsername(request.getUsername())
                .orElseThrow(()->new RuntimeException("User not found"));

        // Check if user has verified their email
        if (user.getRole() == Role.UNVERIFIED) {
            throw new RuntimeException("Please verify your email before logging in");
        }

        var jwtToken=jwtService.generateToken(user);
        return AuthenticationResponse.builder()
                .token(jwtToken)
                .build();
    }

    public AuthenticationResponse verifyEmail(String token) {
        try {
            // Extract username from token
            String username = jwtService.extractUsername(token);

            // Find user
            var user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            // Check if token is valid
            if (!jwtService.isTokenValid(token, user)) {
                throw new RuntimeException("Invalid or expired verification token");
            }

            // Update user role to STUDENT
            user.setRole(Role.STUDENT);
            userRepository.save(user);

            // Generate login token
            var jwtToken = jwtService.generateToken(user);

            return AuthenticationResponse.builder()
                    .token(jwtToken)
                    .message("Email verified successfully! You can now use your account.")
                    .build();

        } catch (Exception e) {
            throw new RuntimeException("Email verification failed: " + e.getMessage());
        }
    }
}
