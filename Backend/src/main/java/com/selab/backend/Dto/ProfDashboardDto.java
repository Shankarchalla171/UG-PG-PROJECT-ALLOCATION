package com.selab.backend.Dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProfDashboardDto {
    private String  name;
    private String departmentName;
    private String email;
    private String profilePhotoPath;
    private Long totalProjects;
    private Long totalApplication;
    private Long pending;
    private Long approved;
    private Long rejected;
}
