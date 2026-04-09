package com.selab.backend.Dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class ProfessorFinalAllocationDto {
    private Long applicationId;
    private Long projectId;
    private String projectTitle;
    private String projectDescription;
    private String duration;
    private LocalDateTime confirmedDate;

    private String professorName;
    private String professorEmail;

    private TeamDto team;

    private Integer totalTeams;
    private Integer totalStudents;
    private Integer activeProjects;
}
