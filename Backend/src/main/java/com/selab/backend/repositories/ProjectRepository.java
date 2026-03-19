package com.selab.backend.repositories;

import com.selab.backend.models.Project;
import com.selab.backend.models.Team;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface ProjectRepository extends JpaRepository<Project, Long> {

    @Query("""
    SELECT p FROM Project p
    WHERE p.projectId NOT IN (
        SELECT pa.project.projectId
        FROM ProjectApplications pa
        WHERE pa.team = :team
    )
    """)
    List<Project> findProjectsNotAppliedByTeam(Team team);
    
    List<Project> findByTitleContainingIgnoreCase(String keyword);
    Optional<Project> findByTitleIgnoreCase(String title);
    List<Project> findByProfessorProfessorId(Long professorId);
    List<Project> findBySlots(int slots);
    List<Project> findBySlotsGreaterThanEqual(int minSlots);
}