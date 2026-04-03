package com.selab.backend.Dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CollaborationRequest {
    @NotNull
    private Long receiverId;
    @NotNull
    private Long projectId;
}
