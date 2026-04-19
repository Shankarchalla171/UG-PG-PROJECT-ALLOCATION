package com.selab.backend.exceptions;

public class NotFoundException extends ApiException {
    public NotFoundException(String message) {
        super("NOT_FOUND", message, 404);
    }
}
