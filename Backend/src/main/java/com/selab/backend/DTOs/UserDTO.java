package com.selab.backend.DTOs;

import com.selab.backend.models.Role;
import com.selab.backend.models.Student;
import lombok.Data;

@Data
public class UserDTO {
    private Long id;
    private Student student;
    private String username;
    private String email;
    private Role role;
}
