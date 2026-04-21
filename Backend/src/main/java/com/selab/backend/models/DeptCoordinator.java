package com.selab.backend.models;


import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.util.List;

@Entity
@Table(name="dept_coordinators")
@Data

public class DeptCoordinator {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long deptCoordinatorId;

    @Column(nullable = false)
    private String deptName;

    @Column(nullable = false)
    private String batch;

    @OneToOne
    @JoinColumn(name="user_id", unique = true)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private User user;

    private Long maxIntake;
    private Long maxTeamSize;
    private Boolean isActive;
}
