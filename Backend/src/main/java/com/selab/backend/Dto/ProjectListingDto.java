package com.selab.backend.Dto;

import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Data
public class ProjectListingDto {

    private Long id;
    private String projectTitle;
    private String description;
    private String facultyName;
    private List<String> domains;
    private String duration;
    private String preRequisites;
    private int availableSlots;
    private LocalDate appliedOn;
    private boolean teamConfirmed;
    private int teamSize;
}