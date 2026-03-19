package com.selab.backend.Dto;

import lombok.*;


@Getter
@AllArgsConstructor
@Builder
public class ProjectResponseDto {
    private Long projectId;
    private String title;
    private String description;
    private Integer slots;
    private String domain;
    private String duration;
    private String domain;
    private String prerequisites;
    private ProfDto professor;

}
