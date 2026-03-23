package com.selab.backend.Dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class ProfessorApplicationDto {

    private Long applicationId;
    private String projectTitle;
    private TeamDto team;
    private String message;
    private String status;
    private String professorReview;
    private LocalDate appliedOn;

}