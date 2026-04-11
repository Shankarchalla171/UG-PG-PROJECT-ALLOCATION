package com.selab.backend.exceptions;

public class BadRequestException extends ApiException {
        public BadRequestException(String message) {
            super("BAD_REQUEST", message, 400);
        }
}

