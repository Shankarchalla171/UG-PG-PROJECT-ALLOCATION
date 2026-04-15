package com.selab.backend.repositories;

import com.selab.backend.models.Professor;
import com.selab.backend.models.ProfessorBatchQuota;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ProfessorBatchQuotaRepository extends JpaRepository<ProfessorBatchQuota, Long> {

    /**
     * Find quota row for a professor and batch
     */
    Optional<ProfessorBatchQuota> findByProfessorAndBatch(
            Professor professor,
            String batch
    );

    /**
     * Get all quota rows for one professor
     */
    List<ProfessorBatchQuota> findByProfessor(Professor professor);

    /**
     * Check if quota already exists
     */
    boolean existsByProfessorAndBatch(
            Professor professor,
            String batch
    );
}
