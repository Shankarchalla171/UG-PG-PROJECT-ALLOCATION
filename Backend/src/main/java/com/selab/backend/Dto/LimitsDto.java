package com.selab.backend.Dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LimitsDto {
    private Long facultyIntakeLimit;
    private Long StudentTeamSizeLimit;
}
