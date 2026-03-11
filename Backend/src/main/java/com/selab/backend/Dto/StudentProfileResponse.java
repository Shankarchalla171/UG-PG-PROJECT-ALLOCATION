package com.selab.backend.Dto;

import lombok.Data;

@Data
public class StudentProfileResponse {
    private String name;
    private String collegeEmailId;
    private String departmentName;
    private String rollNumber;
    private String resumePath;
    private String profilePhotoLink;
}
