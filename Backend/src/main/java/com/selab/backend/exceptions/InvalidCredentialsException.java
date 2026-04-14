package com.selab.backend.exceptions;

public class InvalidCredentialsException extends ApiException {
    public InvalidCredentialsException(String message) {
        super("INVALID_CREDENTIALS", message, 401);
    }
}