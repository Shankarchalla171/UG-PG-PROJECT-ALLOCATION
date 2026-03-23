package com.selab.backend.controller;

import com.selab.backend.Dto.AdminCreateUserRequest;
import com.selab.backend.Dto.AdminMakeCoordinatorRequest;
import com.selab.backend.Dto.AdminUserResponse;
import com.selab.backend.models.Role;
import com.selab.backend.models.User;
import com.selab.backend.services.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
public class AdminController {

    private final UserService userService;

    @GetMapping("/users")
    public List<AdminUserResponse> getAllUsers() {
        return userService.getAllUsers();
    }

    @PostMapping("/users")
    public User createUser(@RequestBody AdminCreateUserRequest request) {
        return userService.createUserByAdmin(request);
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.ok("Deleted");
    }

    // ✅ Assign role (STUDENT / PROFF etc.)
    @PutMapping("/users/{id}/role")
    public User assignRole(
            @PathVariable Long id,
            @RequestParam Role role
    ) {
        return userService.assignRole(id, role);
    }

    // ✅ Make department coordinator
    @PostMapping("/users/{id}/make-coordinator")
    public void makeCoordinator(@PathVariable Long id, @RequestBody AdminMakeCoordinatorRequest request) {
        userService.makeCoordinator(id, request.getDeptName());
    }
}
