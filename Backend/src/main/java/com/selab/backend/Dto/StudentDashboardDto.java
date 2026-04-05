package com.selab.backend.Dto;

import jakarta.annotation.security.DenyAll;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.mapstruct.BeanMapping;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentDashboardDto {
    private String  name;
    private  String rollNumber;
    private String departmentName;
    private String collegeEmailId;
    private String profilePhotoLink;
    private Long totalApplication;
    private Long pending;
    private Long approved;
    private Long rejected;

}
