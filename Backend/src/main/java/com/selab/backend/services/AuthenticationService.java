package com.selab.backend.services;

import com.selab.backend.auth.AuthenticationRequest;
import com.selab.backend.auth.AuthenticationResponse;
import com.selab.backend.auth.JwtService;
import com.selab.backend.auth.RegisterRequest;
import com.selab.backend.exceptions.*;
import com.selab.backend.models.*;
import com.selab.backend.repositories.OtpRepo;
import com.selab.backend.repositories.StudentRepository;
import com.selab.backend.repositories.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.*;

@Service
@RequiredArgsConstructor
public class AuthenticationService {

    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final EmailService emailService;
    private final OtpRepo otpRepo;

    @Transactional
    public AuthenticationResponse register(RegisterRequest registerRequest) {
        // Check if user already exists
        if (userRepository.findByUsername(registerRequest.getUsername()).isPresent()) {
            throw new UsernameAlreadyExistsException("Username already exists");
        }
        if (userRepository.findByEmail(registerRequest.getEmail()).isPresent()) {
            throw new EmailAlreadyExistsException("Email already exists");
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
                .teamRole(null)
                .message("Registration successful! Please verify your email to activate your account.")
                .build();
    }

    private String generateVerificationToken(User user) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("purpose", "email_verification");
        return jwtService.generateToken(claims, user);
    }

    public AuthenticationResponse authenticate(AuthenticationRequest request) {
        // This will throw BadCredentialsException if authentication fails
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getUsername(),
                        request.getPassword()
                )
        );

        // Find the user
        var user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        // Check if user has verified their email
        if (user.getRole() == Role.UNVERIFIED) {
            throw new AuthenticationFailedException("Please verify your email before logging in");
        }

        // Generate JWT token
        var jwtToken = jwtService.generateToken(user);

        // Get team info if student
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

        return AuthenticationResponse.builder()
                .token(jwtToken)
                .role(user.getRole().toString())
                .teamRole(teamRole)
                .message("Login successful")
                .build();
    }

    public AuthenticationResponse verifyEmail(String token) {
        // Extract username from token
        String username = jwtService.extractUsername(token);
        if (username == null) {
            throw new AuthenticationFailedException("Invalid verification token");
        }

        // Find user
        var user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        // Check if token is valid
        if (!jwtService.isTokenValid(token, user)) {
            throw new AuthenticationFailedException("Invalid or expired verification token");
        }

        // Update user role to USER
        user.setRole(Role.USER);
        userRepository.save(user);

        // Generate login token
        var jwtToken = jwtService.generateToken(user);

        return AuthenticationResponse.builder()
                .token(jwtToken)
                .role(user.getRole().toString())
                .message("Email verified successfully! You can now use your account.")
                .build();
    }

    @Transactional
    public String sendOtp(String email) {
        if (!userRepository.existsByEmail(email)) {
            throw new UserNotFoundException("There's no user with this email address. Try signing up.");
        }

        // Delete any existing OTP for this email
        if (otpRepo.existsByEmail(email)) {
            otpRepo.delete(otpRepo.findByEmail(email));
        }

        SecureRandom random = new SecureRandom();
        int otp = random.nextInt(100000, 1000000);
        OTPStore otpStore = new OTPStore();
        otpStore.setOtp(passwordEncoder.encode(String.valueOf(otp)));
        otpStore.setEmail(email);
        otpStore.setTime(Instant.now());
        otpRepo.save(otpStore);

        User user = userRepository.findByEmail(email).get();
        emailService.sendOtpEmail(email, user.getUsername(), otp);

        return "Kindly check your mail for the OTP.";
    }

    @Transactional
    public Map<String, String> validateOtp(String email, Integer otp) {
        OTPStore otpStore = otpRepo.findByEmail(email);

        if (otpStore == null) {
            throw new InvalidOtpException("No OTP requested for this email");
        }

        if (otpStore.getTime().plus(15, ChronoUnit.MINUTES).isAfter(Instant.now()) &&
                passwordEncoder.matches(String.valueOf(otp), otpStore.getOtp())) {

            User u = userRepository.findByEmail(email).get();
            String token = jwtService.generateToken(u);
            otpRepo.delete(otpStore);

            Map<String, String> map = new HashMap<>();
            map.put("token", token);
            map.put("Status", "Verification success");
            return map;
        }

        if (!otpStore.getTime().plus(15, ChronoUnit.MINUTES).isAfter(Instant.now())) {
            otpRepo.delete(otpStore);
        }
        throw new InvalidOtpException("This OTP is either invalid or expired. Please request a new OTP.");
    }

    @Transactional
    public String resetPassword(String token, String newPassword) {
        String username = jwtService.extractUsername(token);
        if (username == null) {
            throw new AuthenticationFailedException("Invalid token");
        }

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        if (!jwtService.isTokenValid(token, user)) {
            throw new AuthenticationFailedException("Invalid or expired token");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        return "Password reset successfully";
    }
}