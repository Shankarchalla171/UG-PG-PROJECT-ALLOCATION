package com.selab.backend.Dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ProfProfileResponse {
    private String name;
    private String email;
    private String departmentName;
    private String domain;
    private String officeNumber;
    private String googleScholarLink;
//    private byte[] profilePhotoPath;
}
