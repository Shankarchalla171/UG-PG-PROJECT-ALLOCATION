package com.selab.backend.controller;


import com.selab.backend.auth.AuthenticationRequest;
import com.selab.backend.auth.AuthenticationResponse;
import com.selab.backend.auth.RegisterRequest;
import com.selab.backend.auth.AuthenticationService;
import com.selab.backend.auth.JwtService;
import com.selab.backend.repositories.UserRepository;
import com.selab.backend.models.User;
import lombok.RequiredArgsConstructor;
import org.aspectj.lang.annotation.RequiredTypes;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthenticationController {
    private final AuthenticationService authenticationService;
    private final JwtService jwtService;
    private final UserRepository userRepository;


    @PostMapping("/register")
    public ResponseEntity<AuthenticationResponse> register(@RequestBody RegisterRequest request){
        return ResponseEntity.ok(authenticationService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthenticationResponse> authenticate(@RequestBody AuthenticationRequest request){
        return  ResponseEntity.ok(authenticationService.authenticate(request));
    }

    @GetMapping("/parse")
    public ResponseEntity<Map<String, String>> parseToken(@RequestHeader(value = "Authorization", required = true) String authorizationHeader){
        if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
            return ResponseEntity.badRequest().body(Map.of("error","Missing or invalid Authorization header"));
        }
        String token = authorizationHeader.substring(7);
        String username = jwtService.extractUsername(token);
        if (username == null) {
            return ResponseEntity.badRequest().body(Map.of("error","Invalid token"));
        }
        var userOpt = userRepository.findByUsername(username);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("username", username));
        }
        User user = userOpt.get();
        Map<String,String> resp = new HashMap<>();
        resp.put("username", user.getUsername());
        resp.put("email", user.getEmail());
        resp.put("role", user.getRole().toString());
        return ResponseEntity.ok(resp);
    }

}
