package com.selab.backend.models;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;


@Entity
@Table(name = "students")
@Data
public class Student {

    @Id
    private Long studentId;

    private String rollNumber;
//    @NotBlank
    private String userName;

    private String name;

    @Email
    private String collegeEmailId;
    private String departmentName;


    private  String resumePath;



}