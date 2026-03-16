package com.selab.backend.Dto;

import lombok.Data;

@Data
public class ApplyProjectRequest {

    private Long projectId;
    private String message; // optional

}