package com.selab.backend.models;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Entity
@Table(name="users")
@Data
public class User {
    @Id
    @Column(nullable = false)
    private Long id;
    @NotBlank
    @Column(nullable = false)
    private String email;
    @NotBlank
    @Column(nullable = false)
    private String password;
    @NotBlank
    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private Role role;
}
