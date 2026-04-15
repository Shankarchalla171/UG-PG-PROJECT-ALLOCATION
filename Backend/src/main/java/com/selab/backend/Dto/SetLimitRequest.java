package com.selab.backend.Dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class SetLimitRequest {
    @NotNull
    private Long limit;
}
