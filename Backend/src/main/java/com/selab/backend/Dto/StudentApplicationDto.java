package com.selab.backend.Dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class StudentApplicationDto {

    private Long applicationId;
    private String projectTitle;
    private String facultyName;
    private String status;
    private String message;
    private LocalDate appliedOn;

}