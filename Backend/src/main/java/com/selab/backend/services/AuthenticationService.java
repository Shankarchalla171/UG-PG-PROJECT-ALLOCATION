package com.selab.backend.services;

import com.selab.backend.auth.AuthenticationRequest;
import com.selab.backend.auth.AuthenticationResponse;
import com.selab.backend.auth.JwtService;
import com.selab.backend.auth.RegisterRequest;
import com.selab.backend.exceptions.InvalidOtpException;
import com.selab.backend.exceptions.UserNotFoundException;
import com.selab.backend.models.OTPStore;
import com.selab.backend.models.Role;
import com.selab.backend.models.User;
import com.selab.backend.repositories.OtpRepo;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import com.selab.backend.repositories.UserRepository;
import com.selab.backend.services.EmailService;

import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.time.temporal.TemporalAmount;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuthenticationService
{
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final EmailService emailService;
    private final OtpRepo otpRepo;

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

    @Transactional
    public String sendOtp(String email) {
        if(!userRepository.existsByEmail(email)) {
            throw new UserNotFoundException("There's no user with this email address. Try signing up.");
        }
        if(otpRepo.existsByEmail(email)) otpRepo.delete(otpRepo.findByEmail(email));
//        boolean otpExists=false;
//        if(otpRepo.existsByEmail(email)) {
//            OTPStore otpStore=otpRepo.findByEmail(email);
//            if(otpStore.getTime().plus(15, ChronoUnit.MINUTES).isAfter(Instant.now())) {
//                emailService.sendOtpEmail(email, userRepository.findByEmail(email).get().getUsername(), otpStore.getOtp());
//                otpExists=true;
//            }
//            else {
//                otpRepo.delete(otpStore);
//            }
//        }
        SecureRandom random = new SecureRandom();
        int otp = random.nextInt(100000, 1000000);
        OTPStore otpStore = new OTPStore();
        otpStore.setOtp(passwordEncoder.encode(String.valueOf(otp)));
        otpStore.setEmail(email);
        otpStore.setTime(Instant.now());
        otpRepo.save(otpStore);
        emailService.sendOtpEmail(email, userRepository.findByEmail(email).get().getUsername(), otp);

        return "Kindly check your mail for the OTP.";
    }

    @Transactional
    public Map<String, String> validateOtp(String email, Integer otp) {
        OTPStore otpStore=otpRepo.findByEmail(email);

        /* Tried to implement multiple otp scenario.
         Falling back to single otp scenario due to latency issues with bcrypt encoder
         */
//        Set<OTPStore> validOtpStores=otpStoreSet
//                .stream().
//                filter(
//                        otpStore->
//                                otpStore
//                                        .getTime()
//                                        .plus(15, ChronoUnit.MINUTES)
//                                        .isAfter(Instant.now()))
//                .collect(Collectors.toSet());
//
//        Set<OTPStore> invalidOtpStores=otpStoreSet
//                .stream()
//                .filter(
//                        otpStore->
//                                otpStore.getTime().plus(15, ChronoUnit.MINUTES).isBefore(Instant.now())
//                )
//                .collect(Collectors.toSet());
//        otpRepo.deleteAll(invalidOtpStores);
//        Set<String> validOtps=validOtpStores
//                .stream()
//                .map(otpStore->otpStore.getOtp())
//                .collect(Collectors.toSet());
//        String encodedOtp=passwordEncoder.encode(String.valueOf(otp));
        if(otpStore.getTime().plus(15, ChronoUnit.MINUTES).isAfter(Instant.now())&&
                passwordEncoder.matches(String.valueOf(otp), otpStore.getOtp())) {
            User u=userRepository.findByEmail(email).get();
            String token=jwtService.generateToken(u);
            otpRepo.delete(otpStore);
            Map<String, String> map=new HashMap<>();
            map.put("token", token);
            map.put("Status", "Verification success");
            return map;
        }
        if(!otpStore.getTime().plus(15, ChronoUnit.MINUTES).isAfter(Instant.now())) {
            otpRepo.delete(otpStore);
        }
        throw new InvalidOtpException("This otp is either invalid or expired. please request a new otp");
    }

    @Transactional
    public String resetPassword(String token, String newPassword) {
        // Validate token
        String username = jwtService.extractUsername(token);
        if (username == null) {
            throw new RuntimeException("Invalid token");
        }

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        // Check if token is valid and has the correct purpose
        if (!jwtService.isTokenValid(token, user)) {
            throw new RuntimeException("Invalid or expired token");
        }

        // Update password
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        return "Password reset successfully";
    }
}