package com.selab.backend.Dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AdminUserResponse {
    private Long id;
    private String userName;
    private String email;
    private String role;
    private String departmentName;
}
