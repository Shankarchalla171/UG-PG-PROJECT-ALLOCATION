package com.selab.backend.auth;

import lombok.Data;

@Data
public class GoogleAuthRequest {
    private String token;
    private String email;

}



