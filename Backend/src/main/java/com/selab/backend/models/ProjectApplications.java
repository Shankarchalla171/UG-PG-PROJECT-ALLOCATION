package com.selab.backend.models;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name= "project_applications")
public class ProjectApplications {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long AppliedProjectsId;

    @ManyToOne
    @JoinColumn(name="projectId",nullable = false)
    private Project project;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private ApplicationStatus status;

    @ManyToOne
    @JoinColumn(name="teamId",nullable = false)
    private Team team;

}
