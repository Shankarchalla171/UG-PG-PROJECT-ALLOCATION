package com.selab.backend.Dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class AdminMakeCoordinatorRequest {
    @NotBlank(message = "Department name is required")
    @Size(max = 255, message = "Department name must be less than 255 characters")
    private String deptName;

    @NotNull(message = "User ID is required")
    private Long userId;

    @NotBlank(message = "Batch is required")
    @Pattern(
            regexp = "^[BPM][0-9]{2}$",
            message = "Batch must be like B23, M22, P21 (B/P/M followed by 2 digits)"
    )
    private String batch;
}
