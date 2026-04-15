package com.selab.backend.Dto;

import com.selab.backend.models.Phase;
import lombok.Data;

import java.time.LocalDate;
@Data
public class DeadLineDto {
    private Long id;
    private Phase title;
    private  String description;
    private LocalDate startDate;
    private LocalDate endDate;
    private String status;
    private LocalDate lastModified;
}
