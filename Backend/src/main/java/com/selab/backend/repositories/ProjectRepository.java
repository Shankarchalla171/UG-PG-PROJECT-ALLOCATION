package com.selab.backend.repositories;

import com.selab.backend.models.Project;
import com.selab.backend.models.Team;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

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

}