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
    private String rollNumber;
//    @NotBlank
    private String userName;

//    @NotBlank
    private String name;

//    @NotBlank
    @Email
    private String collegeEmailId;
//    @NotBlank
    private String departmentName;

//    @NotBlank
    private  String resumePath;



}