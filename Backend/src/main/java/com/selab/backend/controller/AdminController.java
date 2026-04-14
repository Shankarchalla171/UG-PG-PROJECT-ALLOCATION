package com.selab.backend.controller;

import com.selab.backend.Dto.AdminCreateUserRequest;
import com.selab.backend.Dto.AdminMakeCoordinatorRequest;
import com.selab.backend.Dto.AdminUserResponse;
import com.selab.backend.models.Role;
import com.selab.backend.models.User;
import com.selab.backend.responses.ApiResponse;
import com.selab.backend.services.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final UserService userService;

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<List<AdminUserResponse>>> getAllUsers() {
        return ResponseEntity.ok(
                ApiResponse.success(userService.getAllUsers())
        );
    }

    @PostMapping("/users")
    public ResponseEntity<ApiResponse<User>> createUser(
            @RequestBody AdminCreateUserRequest request
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(userService.createUserByAdmin(request))
        );
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<ApiResponse<String>> deleteUser(
            @PathVariable Long id
    ) {
        userService.deleteUser(id);

        return ResponseEntity.ok(
                ApiResponse.success("Deleted successfully")
        );
    }

    // ✅ Make department coordinator
    @PostMapping("/users/{id}/make-coordinator")
    public ResponseEntity<ApiResponse<String>> makeCoordinator(
            @RequestBody AdminMakeCoordinatorRequest request
    ) {
        userService.makeCoordinator(
                request.getUserId(),
                request.getDeptName(),
                request.getBatch()
        );

        return ResponseEntity.ok(
                ApiResponse.success("Coordinator assigned successfully")
        );
    }
}
