package com.selab.backend.Dto;

import lombok.Data;

@Data
public class ViewConfirmationsDto {
    private Long applicationId;
    private String projectTitle;
    private String projectDescription;
    private String duration;
    private String facultyName;
    private Integer projectAvailableSlots;  // Remaining slots for this project

    // Can this team confirm this application?
    private Boolean canConfirm;
    private String message; // If canConfirm is false, explain why
}