package com.selab.backend.exceptions;

public class ForbiddenException extends ApiException {
    public ForbiddenException(String message) {
        super("FORBIDDEN", message, 403);
    }
}