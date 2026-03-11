package com.selab.backend.models;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import lombok.*;

import java.util.List;

@Entity
@Table(name="professors")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Professor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long professorId;

    @Email
    @Column(nullable = false)
    private String email;
//    @NotBlank
    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String departmentName;

    @Column(nullable = false)
    private String domain;

    @Column(nullable = false)
    private String googleScholarLink;
    @Column(nullable = false)
    private  String officeNumber;

    @Column(nullable = false)
    private String profilePhotoPath;

    @OneToOne
    @JoinColumn(name="user_id")
    private User user;

    @OneToMany(mappedBy = "professor" , cascade = CascadeType.ALL,fetch = FetchType.LAZY)
    private List<Project> projects;
}
