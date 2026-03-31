package com.selab.backend.Dto;

import lombok.Data;

@Data
public class CollaborationRequest {
    private Long receiverId;
    private Long projectId;
}
