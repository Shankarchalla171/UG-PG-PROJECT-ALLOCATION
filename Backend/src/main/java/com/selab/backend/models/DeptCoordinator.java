package com.selab.backend.models;


import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Table(name="dept_cordinator")
@Data

public class DeptCordinator {
    @Id
    private Long deptCordinatorId;


    private String email;

//    @NotBlank
    private String DeptName;




}
