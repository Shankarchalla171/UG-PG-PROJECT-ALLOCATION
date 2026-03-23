package com.selab.backend.Dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class RemainderEmail {
    @NotBlank(message = "subject cant be empty or blank")
    private String subject;
    @NotBlank(message = "body cant be empty or blank")
    private String body;
    @NotBlank(message = "batch cant be empty or blank")
    private String batch;
}
