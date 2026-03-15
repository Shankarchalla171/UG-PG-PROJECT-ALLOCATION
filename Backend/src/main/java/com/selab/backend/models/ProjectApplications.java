package com.selab.backend.models;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.Length;
import java.time.LocalDateTime;

@Entity
@Data
@Table(name="projectApplications")
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

    @Column(name = "message", length = 500)
    private String message;

    @Column(name = "applied_on")
    private LocalDateTime appliedOn;

    @Column(name = "professorReview")
    private String professorReview;

}
