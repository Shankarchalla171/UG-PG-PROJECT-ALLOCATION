package com.selab.backend.Dto;

import lombok.Data;

@Data
public class ViewConfirmationsDto {
    private Long applicationId;
    private String projectTitle;
    private String projectDescription;
    private String duration;
    private String facultyName;
    private Integer facultyAvailableSlots;
    private Boolean canConfirm;
    private String message;
}