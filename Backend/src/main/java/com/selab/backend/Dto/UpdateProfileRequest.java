package com.selab.backend.Dto;

import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

@Data
public class UpdateProfileRequest {
    private  String name;
    private  String departmentName;
    private  String rollNumber;
    private  String collegeEmailId;
    private  String email;
    private  String domain;
    private  String googleScholarLink;
    private  String officeNumber;
    private  MultipartFile profilePhoto;
    private  MultipartFile resume;
}
