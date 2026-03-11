package com.selab.backend.repositories;

import com.selab.backend.models.Professor;
import com.selab.backend.models.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ProfessorRepository extends JpaRepository<Professor,Long> {
    Optional<Professor> findByUser(User user);
}
