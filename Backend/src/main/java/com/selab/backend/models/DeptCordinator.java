package com.selab.backend.models;


import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Entity
@Table(name="faculty_cordinator")
@Data

public class FacultyCordinator {
    @Id
    private String email;

//    @NotBlank
    private String DeptName;




}
