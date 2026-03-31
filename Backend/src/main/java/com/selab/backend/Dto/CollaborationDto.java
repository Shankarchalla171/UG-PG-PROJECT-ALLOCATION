package com.selab.backend.Dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CollaborationDto {
    private Long id;
    private String senderName;
    private String receiverName;
    private String status;
    private String projectTitle;
}
