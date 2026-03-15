package com.selab.backend.Dto;

import lombok.*;

import java.util.List;

@Getter
@AllArgsConstructor
@Builder
public class ProjectResponseDto {
    private Long projectId;
    private String title;
    private String description;
    private Integer slots;
    private String duration;
    private String prerequisites;
    private ProfDto professor;

}
