package com.selab.backend.Dto;

import lombok.Data;

@Data
public class ProfProfileResponse {
    private String name;
    private String email;
    private String departmentName;
    private String domain;
    private String officeNumber;
    private String googleScholarLink;
}
