package com.selab.backend.repositories;

import com.selab.backend.models.Professor;
import com.selab.backend.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ProfessorRepository extends JpaRepository<Professor,Long> {
    Optional<Professor> findByUser(User user);
    Optional<Professor> findByUserId(Long userID);

    List<Professor> findAllByStudentsTakenLessThanEqual(Long allowed);
}
