package com.selab.backend.exceptions;

public class UnauthorizedException extends ApiException {
    public UnauthorizedException(String message) {
        super("UNAUTHORIZED", message, 401);
    }
}