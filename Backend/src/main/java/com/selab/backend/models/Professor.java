package com.selab.backend.models;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Entity
@Table(name="professors")
@Data
public class Professor {

    @Id
    @Email
    private String email;
    @NotBlank
    private String userName;

    @NotBlank
    private String departmentName;

    @NotBlank
    private String domain;

    @NotBlank
    private String googleScholarLink;
    @NotBlank
    private  String officeNumber;

}
