package com.selab.backend.Dto;

import lombok.Data;

@Data
public class StudentDto {
    private Long  studentId;
    private String name;
    private String collegeEmailId;
    private String departmentName;
    private String rollNumber;
    private String resumePath;
    private String profilePhotoLink;
    private String teamRole;
}
