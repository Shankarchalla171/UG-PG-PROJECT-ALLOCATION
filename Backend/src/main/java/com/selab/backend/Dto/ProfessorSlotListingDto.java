package com.selab.backend.Dto;

import lombok.Data;

import java.util.List;

@Data
public class ProfessorSlotListingDto {
    private String name;
    private String profilePhotoPath;
    private List<String> domains;
}
