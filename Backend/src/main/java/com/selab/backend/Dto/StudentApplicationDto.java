package com.selab.backend.Dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class StudentApplicationDto {

    private Long applicationId;
    private String projectTitle;
    private String facultyName;
    private int slots;
    private long competitors;
    private String status;
    private String message;
    private LocalDateTime appliedOn;

}