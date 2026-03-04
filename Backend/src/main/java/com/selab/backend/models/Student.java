package com.selab.backend.models;

import jakarta.persistence.*;
import lombok.Data;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;


@Entity
@Table(name = "students")
@Data
public class Student {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long studentId;

    private String rollNumber;
//    @NotBlank
    private String userName;

    private String name;

    @Email
    private String collegeEmailId;
    private String departmentName;


    private  String resumePath;

    @ManyToOne
    @JoinColumn(name="teamId")
    private Team team;



}