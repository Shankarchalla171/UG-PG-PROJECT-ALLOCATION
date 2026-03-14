package com.selab.backend.models;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Table(name="otp_store")
@NoArgsConstructor
@Entity
@Data
public class OTPStore {
    @Id
    @GeneratedValue(strategy=GenerationType.AUTO)
    private long id;
    private String email;
    private String otp;
    private Instant time;
}
