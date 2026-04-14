package com.selab.backend.responses;

public class ApiError {

    private String code;
    private Object message;

    public ApiError(String code, Object message) {
        this.code = code;
        this.message = message;
    }

    public String getCode() {
        return code;
    }

    public Object getMessage() {
        return message;
    }
}