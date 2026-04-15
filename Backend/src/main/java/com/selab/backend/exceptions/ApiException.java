package com.selab.backend.exceptions;

public class ApiException extends RuntimeException {
    private final String code;
    private final int status;

    protected ApiException(String code, String message, int status) {
        super(message);
        this.code = code;
        this.status = status;
    }

    public String getCode() {
        return code;
    }

    public int getStatus() {
        return status;
    }
}
