package com.selab.backend.responses;

public class ApiResponse<T> {

    private boolean success;
    private T data;
    private ApiError error;

    public ApiResponse(boolean success, T data, ApiError error) {
        this.success = success;
        this.data = data;
        this.error = error;
    }

    // Success factory
    public static <T> ApiResponse<T> success(T data) {
        return new ApiResponse<>(true, data, null);
    }

    // Error factory
    public static ApiResponse<?> error(String code, Object message) {
        return new ApiResponse<>(false, null, new ApiError(code, message));
    }

    public boolean isSuccess() {
        return success;
    }

    public T getData() {
        return data;
    }

    public ApiError getError() {
        return error;
    }
}
