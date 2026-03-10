package com.selab.backend.Dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProfCreateProfileRequest {
    @NotBlank(message = "name cant be blank or null")
    private  String name;

    @NotBlank(message = "email cant be blank or null")
    private  String email;
    @NotBlank(message = "department cant be blank or null")
    private String departmentName;
    @NotBlank(message = "domains  cant be blank or null")
    private String domain;
    @NotBlank(message = "link  cant be blank or null")
    private String googleScholarLink;
    @NotBlank(message = "officeNumber  cant be blank or null")
    private String officeNumber;

}
