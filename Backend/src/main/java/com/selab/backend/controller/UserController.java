package com.selab.backend.controller;

import com.selab.backend.DTOs.UserDTO;
import com.selab.backend.models.User;
import com.selab.backend.services.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;
    @GetMapping("/me")
    public Object getUser(@AuthenticationPrincipal User userDetails) {
        return userService.getUser(userDetails);
//        return null;
    }
}
