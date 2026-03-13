package com.selab.backend.Dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;
import java.util.UUID;

@Data
@Builder
public class TeamDto {
    private UUID teamId;
    private List<StudentDto> members;
    private Boolean isFinalized;
}
