package com.selab.backend.Dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.web.multipart.MultipartFile;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StudentProfileRequest {

    @NotBlank(message = "name cant be blank or null")
    @Size(min = 2, max = 50, message = "Name must be between 2 and 50 characters")
    @Pattern(regexp = "^[a-zA-Z][a-zA-Z.\\s-]+$", message = "Name must only contain letters, spaces, or hyphens or full stop & must start with an alphabet")
    private String name;

    @NotBlank(message = " email cant be blank")
    @Email(message = "please provide a valid email address")
    @Pattern(
            regexp = "^[A-Za-z0-9._%+-]+@nitc\\.ac\\.in$",
            message = "Email must be a valid NITC email (@nitc.ac.in)"
    )
    private String collegeEmailId;

    @NotBlank(message = " rollNo  cant be blank")
    @Pattern(
            regexp = "^[BMP][0-9]{6}[A-Z]{2}$",
            message = "Invalid roll number format (e.g., B230668CS)"
    )
    private String rollNo;

    @NotBlank(message = "department cant be blank or null")
    @Size(min = 2, max = 50, message = "department name must be between 2 and 30 characters")
    private String departmentName;

    private MultipartFile resume;
    private  MultipartFile profilePhoto;
}
