package com.selab.backend.Dto;

import lombok.Data;
import java.time.LocalDate;
import java.util.UUID;

@Data
public class ProfessorApplicationDto {

    private Long applicationId;
    private String projectTitle;
    private UUID teamId;
    private String teamName;
    private int teamSize;
    private String message;
    private String status;
    private String professorReview;
    private LocalDate appliedOn;

}