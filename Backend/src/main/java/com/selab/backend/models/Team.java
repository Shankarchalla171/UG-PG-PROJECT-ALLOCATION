package com.selab.backend.models;

import jakarta.persistence.*;
import lombok.Data;

import java.util.List;

@Entity
@Table(name="teams")
@Data
public class Team {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long teamId;
    private String teamName;


    private int teamLeaderId;


    @OneToMany(mappedBy = "team")
    private List<AppliedProject> appliedProjects;






}
