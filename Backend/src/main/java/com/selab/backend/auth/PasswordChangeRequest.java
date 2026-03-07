package com.selab.backend.auth;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class PasswordChangeRequest {
    private String email;
    private Integer otp;
}
