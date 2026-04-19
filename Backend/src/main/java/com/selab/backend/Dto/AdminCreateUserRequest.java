package com.selab.backend.Dto;

import com.selab.backend.models.Role;
import lombok.Data;

@Data
public class AdminCreateUserRequest {
    private String email;
    private String password;
    private Role role;
    private String deptName;
}
