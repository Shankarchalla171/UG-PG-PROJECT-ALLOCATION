package com.selab.backend.Dto;

import com.selab.backend.models.Phase;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class CreateDeadLineRequest {
    @NotBlank(message = "description cant be empty")
    private String description;
    @NotNull(message = "phase cant be empty or null")
    private Phase title;
    @NotNull(message = "startDate be required")
    private LocalDate startDate;
    @NotNull(message = "endDate be required")
    private LocalDate endDate;
}
