package com.selab.backend.models;


import jakarta.persistence.*;
import lombok.Data;

import java.util.List;

@Entity
@Table(name="dept_coordinators")
@Data

public class DeptCoordinator {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long deptCoordinatorId;


    private String email;

//    @NotBlank
    private String DeptName;


    @OneToMany(mappedBy = "deptCoordinator", cascade = CascadeType.ALL,fetch = FetchType.LAZY)
    private List<Project> projects;





}
