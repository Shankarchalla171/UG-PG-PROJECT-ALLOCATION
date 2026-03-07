package com.selab.backend.exceptions;

public class InvalidOtpException extends RuntimeException {
    public InvalidOtpException(String s) {
        super(s);
    }
}
