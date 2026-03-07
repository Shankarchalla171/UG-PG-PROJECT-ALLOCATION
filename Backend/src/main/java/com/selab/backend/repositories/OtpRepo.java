package com.selab.backend.repositories;

import com.selab.backend.models.OTPStore;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Set;

public interface OtpRepo extends JpaRepository<OTPStore, Long> {
    boolean existsByEmail(String email);

    OTPStore findByEmail(String email);
}
