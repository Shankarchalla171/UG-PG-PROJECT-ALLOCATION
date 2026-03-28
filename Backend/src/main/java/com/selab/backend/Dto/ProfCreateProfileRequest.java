package com.selab.backend.Dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.web.multipart.MultipartFile;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProfCreateProfileRequest {
    @NotBlank(message = "name cant be blank or null")
    @Size(min = 2, max = 50, message = "Name must be between 2 and 50 characters")
    @Pattern(regexp = "^[a-zA-Z.\\s-]+$", message = "Name must only contain letters, spaces, or hyphens or full stop")
    private  String name;

    @NotBlank(message = "email cant be blank or null")
    @Email(message = "please provide a valid email address")
    private  String email;

    @NotBlank(message = "department cant be blank or null")
    @Size(min = 2, max = 50, message = "department name must be between 2 and 30 characters")
    private String departmentName;

    @Size(min = 2, max = 50, message = "domain must be between 2 and 50 characters")
    @NotBlank(message = "domains  cant be blank or null")
    private String domain;

    @NotBlank(message = "URL cannot be blank or null")
    @Pattern(regexp = "^(https?|ftp)://.*$", message = "URL must start with http:// or https://")
    private String googleScholarLink;

    @NotBlank(message = "officeNumber  cant be blank or null")
    private String officeNumber;

    @Min(0)
   @NotNull(message = "experience cant be  null")
    private Integer experience;


    private MultipartFile profilePhoto;
}
