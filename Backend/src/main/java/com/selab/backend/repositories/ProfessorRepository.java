package com.selab.backend.repositories;

import com.selab.backend.models.Professor;
import com.selab.backend.models.ProfessorBatchQuota;
import com.selab.backend.models.Project;
import com.selab.backend.models.User;
import org.springframework.data.domain.Limit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ProfessorRepository extends JpaRepository<Professor,Long> {
    Optional<Professor> findByUser(User user);
    Optional<Professor> findByUserId(Long userID);
    List<Professor> findByDepartmentName(String departmentName);  // Add this method

    Optional<Professor> findByProfessorId(Long professorId);

    @Query("select p.email from Professor p ")
    List<String> getAllEmails();

    @Query("SELECT pdq FROM ProfessorBatchQuota pdq WHERE pdq.professor = :professor AND pdq.batch = :batch")
    Optional<ProfessorBatchQuota> findByProfessorAndBatch(
            @Param("professor") Professor professor,
            @Param("batch") String batch
    );
}