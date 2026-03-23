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

    @OneToOne
    @JoinColumn(name="user_id", unique = true)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private User user;

    @OneToMany(mappedBy = "deptCoordinator", cascade = CascadeType.ALL,fetch = FetchType.LAZY)
    private List<Project> projects;


}
