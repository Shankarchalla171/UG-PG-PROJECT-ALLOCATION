package com.selab.backend.repositories;

import com.selab.backend.models.Professor;
import com.selab.backend.models.Project;
import com.selab.backend.models.ProjectApplications;
import com.selab.backend.models.Team;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.List;
import java.util.Optional;

public interface ProjectApplicationsRepository extends JpaRepository<ProjectApplications, Long> {

    Optional<ProjectApplications> findByTeamAndProject(Team team, Project project);
    Page<ProjectApplications> findByTeam(Team team, Pageable pageable);
    Page<ProjectApplications> findByProject_Professor(Professor professor, Pageable pageable);

    long countByProject(Project project);
}