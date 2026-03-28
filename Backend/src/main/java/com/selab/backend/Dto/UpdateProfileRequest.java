package com.selab.backend.Dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.web.multipart.MultipartFile;

@Data
public class UpdateProfileRequest {
    @NotBlank(message = "name cant be blank or null")
    private  String name;
    @NotBlank(message = "department name cant be blank or null")
    private  String departmentName;
    @NotBlank(message = "roll number cant be blank or null")
    private  String rollNumber;
    @NotBlank(message = "college email id cant be blank or null")
    private  String collegeEmailId;
    @NotBlank(message = "email cant be blank or null")
    private  String email;
    @NotBlank(message = "domain cant be blank or null")
    private  String domain;
    @NotNull(message = "experience cant be blank or null")
    @Min(0)
    private Integer experience;
    @NotBlank(message = "google scholar link cant be blank or null")
    private  String googleScholarLink;
    @NotBlank(message = "office number cant be blank or null")
    private  String officeNumber;

    private  MultipartFile profilePhoto;
    private  MultipartFile resume;
}
