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
@AllArgsConstructor
@NoArgsConstructor
@Builder
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

    @Column(name = "title")
    private String title;

    @Column(name = "description")
    private String description;

    @Column(name = "slots")
    private int slots;

    @Column(name = "duration")
    private String duration;

    @Column(name = "pre_requesites")
    private String preRequisites;


    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ProjectApplications> applications;

}
