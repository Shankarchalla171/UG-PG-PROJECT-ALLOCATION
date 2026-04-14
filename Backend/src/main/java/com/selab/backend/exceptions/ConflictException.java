package com.selab.backend.exceptions;

public class ConflictException extends ApiException {
    public ConflictException(String message) {
        super("CONFLICT", message, 409);
    }
}
