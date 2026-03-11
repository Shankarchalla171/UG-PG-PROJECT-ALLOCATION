package com.selab.backend.models;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name="teamMembers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TeamMembers {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="team_id",nullable = false)
    private Team team;

    @OneToOne()
    @JoinColumn(name="student_id",nullable = false)
    private Student member;

    @Enumerated(EnumType.STRING)
    private TeamRole role;

}
