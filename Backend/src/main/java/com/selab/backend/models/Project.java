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
    @JoinColumn(name="coGuideId")
    private Professor coGuide;

    @Column(name = "title")
    private String title;

    @Column(name = "description")
    private String description;

    @Column(name = "slots")
    private Integer slots;

    @Column(name = "domain")
    private String domain;

    @Column(name = "duration")
    private String duration;
    private String preRequisites;

    @Column(name = "allocated_slots", nullable = false)
    @Builder.Default
    private Integer allocatedSlots = 0;


    @OneToMany(mappedBy = "project")
    private List<ProjectApplications> applications;

}
