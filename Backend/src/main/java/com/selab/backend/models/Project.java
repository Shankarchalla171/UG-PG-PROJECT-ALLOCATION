package com.selab.backend.models;


import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Entity
@Table(name="projects")
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
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

    @Column(name = "domain")
    private String domain;

    @Column(name = "duration")
    private String duration;
    private String preRequesites;


    @OneToMany(mappedBy = "project")
    private List<ProjectApplications> applications;

}
