package com.selab.backend.repositories;

import com.selab.backend.models.Professor;
import com.selab.backend.models.Project;
import com.selab.backend.models.Team;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ProjectRepository extends JpaRepository<Project, Long>, JpaSpecificationExecutor<Project> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT p FROM Project p WHERE p.projectId = :id")
    Optional<Project> findByIdForUpdate(@Param("id") Long id);

    @Query("""
    SELECT DISTINCT p.domain 
    FROM Project p
    WHERE p.professor.departmentName = :dept
    AND p.domain IS NOT NULL 
    AND p.domain <> ''
    """)
    List<String> findDistinctDomains(String dept);

    @Query("""
    SELECT DISTINCT p.professor.name 
    FROM Project p
    WHERE p.professor.departmentName = :dept
    """)
    List<String> findDistinctFaculty(String dept);
    
    List<Project> findByTitleContainingIgnoreCase(String keyword);
    Optional<Project> findByTitleIgnoreCase(String title);
    @Query("""
        SELECT p FROM Project p
        WHERE p.professor.professorId = :professorId
           OR p.coGuide.professorId = :professorId
    """)
    List<Project> findByProfessorOrCoGuide(@Param("professorId") Long professorId);
    List<Project> findBySlots(int slots);
    List<Project> findBySlotsGreaterThanEqual(int minSlots);

    Optional<Project> findByProjectId(Long projectId);

    @Query("select count(p) from Project p where p.professor = :professor or p.coGuide = :professor")
    Long countByProfessor(Professor professor);
}