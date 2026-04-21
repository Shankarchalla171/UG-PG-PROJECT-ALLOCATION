package com.selab.backend.repositories;

import com.selab.backend.models.Professor;
import com.selab.backend.models.ProfessorBatchQuota;
import com.selab.backend.models.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

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

    @Query("""
        SELECT pdq.professor FROM ProfessorBatchQuota  pdq
        LEFT JOIN Collaboration c
            ON c.receiver = pdq.professor AND c.project = :project
        WHERE c.id IS NULL
        AND pdq.batch= :batch AND pdq.allocatedStudents <= :allowed
   """)
    List<Professor> findAllAvailableForProject(
            @Param("project") Project project,
            @Param("allowed") Double allowed,
            @Param("batch") String batch
    );
}
