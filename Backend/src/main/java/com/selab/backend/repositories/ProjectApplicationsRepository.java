package com.selab.backend.repositories;

import com.selab.backend.models.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
//import org.springframework.data.jpa.repository.Modifying;
//import org.springframework.data.jpa.repository.Query;
//import org.springframework.data.repository.query.Param;

//import java.util.List;
import java.util.Optional;
//import java.util.UUID;

public interface ProjectApplicationsRepository extends JpaRepository<ProjectApplications, Long> {

    Optional<ProjectApplications> findByTeamAndProject(Team team, Project project);
    Page<ProjectApplications> findByTeam(Team team, Pageable pageable);
    Page<ProjectApplications> findByProject_Professor(Professor professor, Pageable pageable);
    boolean existsByTeamAndProject_Professor(Team team, Professor professor);
    Page<ProjectApplications> findByProject_ProfessorAndStatus(
            Professor professor,
            ApplicationStatus status,
            Pageable pageable
    );

    boolean existsByTeamAndStatus(Team team, ApplicationStatus status);

    long countByProject(Project project);
}