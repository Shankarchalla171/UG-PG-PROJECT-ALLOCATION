package com.selab.backend.exceptions;

public class UnprocessableEntityException extends ApiException {
    public UnprocessableEntityException(String message) {
        super("UNPROCESSABLE_ENTITY", message, 422);
    }
}
