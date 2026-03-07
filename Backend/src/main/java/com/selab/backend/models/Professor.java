package com.selab.backend.models;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import lombok.Data;

import java.util.List;

@Entity
@Table(name="professors")
@Data
public class Professor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long professorId;


    @Email

    private String email;
//    @NotBlank
    private String userName;

//    @NotBlank
    private String departmentName;

//    @NotBlank
    private String domain;

//    @NotBlank
    private String googleScholarLink;
//    @NotBlank
    private  String officeNumber;


    @OneToMany(mappedBy = "professor" , cascade = CascadeType.ALL,fetch = FetchType.LAZY)
    private List<Project> projects;


}
