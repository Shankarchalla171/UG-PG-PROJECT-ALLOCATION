package com.selab.backend.Dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.web.multipart.MultipartFile;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StudentCreateProfileRequest {
    @NotBlank(message = " name  cant be null")
    private String name;

    @NotBlank(message = " email cant be blank")
    private String collegeEmailId;
    @NotBlank(message = " rollNo  cant be blank")
    private String rollNo;
    @NotBlank(message = " departmentName cant be blank")
    private String departmentName;

    private MultipartFile resume;
    private  MultipartFile profilePhoto;
}
