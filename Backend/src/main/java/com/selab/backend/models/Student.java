package com.selab.backend.models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.NoArgsConstructor;


@Entity
@Table(name = "students")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Student  {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long studentId;

    @Column(nullable = false)
    private String rollNumber;
//    @NotBlank
    @OneToOne()
    @JoinColumn(name = "user_id",nullable = false)
    private User user;
//    private Long userId;

    @Column(nullable = false)
    private String name;

    @Email
    @Column(nullable = false)
    private String collegeEmailId;
    @Column(nullable = false)
    private String departmentName;

    private  String resumePath;
    private  String profilePhotoLink;
}