package com.selab.backend.Dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ProjectRequestDto {
    @NotBlank(message = "Title is required")
    private String title;

    private String description;

    @NotNull(message = "Slots are required")
    @Min(value = 1, message = "Slots must be at least 1")
    private Integer slots;  // Use Integer instead of int for null check

    @NotBlank(message = "Duration is required")
    private String duration;

    private String prerequisites;  // Optional field - no validation
}
