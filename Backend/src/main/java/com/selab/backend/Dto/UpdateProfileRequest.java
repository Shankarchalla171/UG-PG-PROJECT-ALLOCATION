package com.selab.backend.Dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.web.multipart.MultipartFile;

@Data

// NOTE !!! - dont write NotNull/ NotBlank validations here since this is a used in only patch request
public class UpdateProfileRequest {

    @Size(min = 2, max = 50, message = "Name must be between 2 and 50 characters")
    private  String name;


    private  String departmentName;
    @Email
    private  String email;
    private  String domain;
    @Min(0)
    private Integer experience;
    private  String googleScholarLink;
    private  String officeNumber;

    @Pattern(
            regexp = "^[BMP][0-9]{6}[A-Z]{2}$",
            message = "Invalid roll number format (e.g., B230668CS)"
    )
    private  String rollNumber;

    @Pattern(
            regexp = "^[A-Za-z0-9._]+@nitc\\.ac\\.in$",
            message = "College email must end with @nitc.ac.in"
    )
    private  String collegeEmailId;

    private  MultipartFile profilePhoto;
    private  MultipartFile resume;
}
