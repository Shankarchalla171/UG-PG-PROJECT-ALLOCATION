package com.selab.backend.models;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name="aplied_projects")
public class AppliedProject {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long AppliedProjectsId;

    @ManyToOne
    @JoinColumn(name="projectId")
    private Project project;

    @ManyToOne
    @JoinColumn(name="teamId")
    private Team team;




}
