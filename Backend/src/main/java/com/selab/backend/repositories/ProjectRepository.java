package com.selab.backend.repositories;

import com.selab.backend.models.Project;
import com.selab.backend.models.Team;
import org.springframework.data.domain.Page;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ProjectRepository extends JpaRepository<Project, Long>, JpaSpecificationExecutor<Project> {


    @Query("SELECT DISTINCT p.domain FROM Project p WHERE p.professor.departmentName = :dept")
    List<String> findDistinctDomainsByDepartment(@Param("dept") String dept);

    @Query("SELECT DISTINCT p.professor.name FROM Project p WHERE p.professor.departmentName = :dept")
    List<String> findDistinctFacultyByDepartment(@Param("dept") String dept);
    
    List<Project> findByTitleContainingIgnoreCase(String keyword);
    Optional<Project> findByTitleIgnoreCase(String title);
    List<Project> findByProfessorProfessorId(Long professorId);
    List<Project> findBySlots(int slots);
    List<Project> findBySlotsGreaterThanEqual(int minSlots);
}