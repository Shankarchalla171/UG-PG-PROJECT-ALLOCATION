package com.selab.backend.Dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DeptCoordinatorDashboardStatsDto {
    private Long totalStudents;
    private Long allocatedStudents;
    private Long availableProjects;
    private Long pendingAllocations;
    private String batch;
    private String departmentName;
}