package com.selab.backend.exceptions;

public class InternalServerException extends ApiException {
    public InternalServerException(String message) {
        super("INTERNAL_ERROR", message, 500);
    }
}
