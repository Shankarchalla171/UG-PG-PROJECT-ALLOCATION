package com.selab.backend.models;


import jakarta.persistence.*;
import lombok.Data;

import java.util.List;

@Entity
@Table(name="projects")
@Data
public class Project {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long projectId;


    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="professorId",nullable = false)
    private Professor professor;


    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="deptCoordinatorId",nullable = false)
    private DeptCoordinator deptCoordinator;

    private String title;
    private String description;
    private int slots;
    private String duration;
    
    @Column(nullable = false, columnDefinition = "VARCHAR(255) DEFAULT ''")
    private String domain;
    
    private String preRequesites;


    @OneToMany(mappedBy = "project")
    private List<ProjectApplications> applications;

}
