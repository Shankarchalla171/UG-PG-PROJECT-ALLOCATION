package com.selab.backend.models;

import jakarta.persistence.*;
import lombok.Data;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;


@Entity
@Table(name = "students")
@Data
public class Student  {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long studentId;

    @Column(nullable = false)
    private String rollNumber;
//    @NotBlank
    @OneToOne()
    @JoinColumn(name = "user_id")
    private User user;
//    private Long userId;

    @Column(nullable = false)
    private String name;

    @Email
    private String collegeEmailId;
    @Column(nullable = false)
    private String departmentName;

    @Column(nullable = false)
    private  String resumePath;
    @Column(nullable = false)
    private  String profilePhotoLink;
}