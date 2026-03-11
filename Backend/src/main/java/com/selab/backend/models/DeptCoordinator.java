package com.selab.backend.models;


import jakarta.persistence.*;
import lombok.Data;

import java.util.List;

@Entity
@Table(name="dept_coordinators")
@Data

public class DeptCoordinator {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long deptCoordinatorId;

    @Column(nullable = false)
    private String DeptName;

    @OneToOne
    @JoinColumn(name="user_id")
    private User user;

    @OneToMany(mappedBy = "deptCoordinator", cascade = CascadeType.ALL,fetch = FetchType.LAZY)
    private List<Project> projects;


}
