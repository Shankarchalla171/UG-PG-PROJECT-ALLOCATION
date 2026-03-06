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
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import com.selab.backend.repositories.UserRepository;
import com.selab.backend.services.EmailService;

import java.util.HashMap;
import java.util.Map;

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
        try {
            // Check if user already exists
            if (userRepository.findByUsername(registerRequest.getUsername()).isPresent()) {
                return AuthenticationResponse.builder()
                        .token(null)
                        .role(null)
                        .message("Username already exists")
                        .build();
            }
            if (userRepository.findByEmail(registerRequest.getEmail()).isPresent()) {
                return AuthenticationResponse.builder()
                        .token(null)
                        .role(null)
                        .message("Email already exists")
                        .build();
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
                    .token(null)
                    .role(null)
                    .message("Registration successful! Please verify your email to activate your account.")
                    .build();

        } catch (Exception e) {
            return AuthenticationResponse.builder()
                    .token(null)
                    .role(null)
                    .message("Registration failed: " + e.getMessage())
                    .build();
        }
    }

    private String generateVerificationToken(User user) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("purpose", "email_verification");
        return jwtService.generateToken(claims, user);
    }

    public AuthenticationResponse authenticate(AuthenticationRequest request) {
        try {
            // Authenticate the user
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getUsername(),
                            request.getPassword()
                    )
            );

            // Find the user
            var user = userRepository.findByUsername(request.getUsername())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            // Check if user has verified their email
            if (user.getRole() == Role.UNVERIFIED) {
                return AuthenticationResponse.builder()
                        .token(null)
                        .role(null)
                        .message("Please verify your email before logging in")
                        .build();
            }

            // Generate JWT token
            var jwtToken = jwtService.generateToken(user);

            // Return successful response with role
            return AuthenticationResponse.builder()
                    .token(jwtToken)
                    .role(user.getRole().toString()) // This will return STUDENT, FACULTY, etc.
                    .message("Login successful")
                    .build();

        } catch (BadCredentialsException e) {
            return AuthenticationResponse.builder()
                    .token(null)
                    .role(null)
                    .message("Invalid username or password")
                    .build();
        } catch (RuntimeException e) {
            if (e.getMessage().equals("User not found")) {
                return AuthenticationResponse.builder()
                        .token(null)
                        .role(null)
                        .message("User not found")
                        .build();
            }
            return AuthenticationResponse.builder()
                    .token(null)
                    .role(null)
                    .message("Authentication failed: " + e.getMessage())
                    .build();
        } catch (Exception e) {
            return AuthenticationResponse.builder()
                    .token(null)
                    .role(null)
                    .message("An unexpected error occurred")
                    .build();
        }
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
                return AuthenticationResponse.builder()
                        .token(null)
                        .role(null)
                        .message("Invalid or expired verification token")
                        .build();
            }

            // Update user role to STUDENT
            user.setRole(Role.STUDENT);
            userRepository.save(user);

            // Generate login token
            var jwtToken = jwtService.generateToken(user);
            user.setRole(Role.STUDENT);
            userRepository.save(user);
            return AuthenticationResponse.builder()
                    .token(jwtToken)
                    .role(user.getRole().toString())
                    .message("Email verified successfully! You can now use your account.")
                    .build();

        } catch (RuntimeException e) {
            return AuthenticationResponse.builder()
                    .token(null)
                    .role(null)
                    .message("Email verification failed: " + e.getMessage())
                    .build();
        } catch (Exception e) {
            return AuthenticationResponse.builder()
                    .token(null)
                    .role(null)
                    .message("An unexpected error occurred during verification")
                    .build();
        }
    }
}