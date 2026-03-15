package com.selab.backend.Dto;


import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ProjectUpdateDto {
    @Size(min = 3, max = 100, message = "Title must be between 3 and 100 characters")
    private String title;

    @Size(min = 10, message = "Description must be at least 10 characters")
    private String description;

    @Min(value = 1, message = "Slots must be at least 1")
    private Integer slots;

    private String duration;

    private String prerequisites;

}
