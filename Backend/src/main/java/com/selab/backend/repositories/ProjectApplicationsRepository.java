package com.selab.backend.repositories;

import com.selab.backend.models.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
//import org.springframework.data.jpa.repository.Modifying;
//import org.springframework.data.jpa.repository.Query;
//import org.springframework.data.repository.query.Param;

//import java.util.List;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
//import java.util.UUID;

public interface ProjectApplicationsRepository extends JpaRepository<ProjectApplications, Long> {

    Optional<ProjectApplications> findByTeamAndProject(Team team, Project project);
    Page<ProjectApplications> findByTeam(Team team, Pageable pageable);
    Page<ProjectApplications> findByProject_Professor(Professor professor, Pageable pageable);
    boolean existsByTeamAndProject_Professor(Team team, Professor professor);
    boolean existsByProjectAndTeam(Project project, Team team);
    Page<ProjectApplications> findByProject_ProfessorAndStatus(
            Professor professor,
            ApplicationStatus status,
            Pageable pageable
    );

    @Query("""
    SELECT COUNT(pa) > 0
    FROM ProjectApplications pa
    WHERE pa.team.teamId = :teamId
    AND pa.status = :status
    """)
    boolean existsConfirmed(@Param("teamId") UUID teamId,
                            @Param("status") ApplicationStatus status);

    long countByProject(Project project);


    @Query("""
    SELECT pa FROM ProjectApplications pa
    JOIN FETCH pa.project
    JOIN FETCH pa.team
    WHERE pa.project.deptCoordinator = :coordinator
    AND pa.status = :status
""")
    List<ProjectApplications>  getAllFinal(@Param("coordinator") DeptCoordinator coordinator,@Param("status")ApplicationStatus status);

    Optional<ProjectApplications> findByAppliedProjectsId(Long appliedProjectsId);

    Page<ProjectApplications> findByProject_ProjectIdAndProject_Professor(
            Long projectId,
            Professor professor,
            Pageable pageable
    );

    Page<ProjectApplications> findByProject_ProjectIdAndProject_ProfessorAndStatus(
            Long projectId,
            Professor professor,
            ApplicationStatus status,
            Pageable pageable
    );

     @Query("select pa.status, count(pa) from ProjectApplications  pa where pa.team =:team group by pa.status")
     List <Object[]>countByTeam(Team team);

    @Query("""
        SELECT pa.status, COUNT(pa)
        FROM ProjectApplications pa
        WHERE pa.project.professor = :professor 
           OR pa.project.coGuide = :professor
        GROUP BY pa.status
   """)
    List<Object[]> countByProfessor(Professor professor);

    // Get all TEAM_CONFIRMED applications for a professor's projects
    @Query("SELECT pa FROM ProjectApplications pa " +
            "JOIN FETCH pa.project p " +
            "JOIN FETCH p.professor prof " +
            "JOIN FETCH pa.team t " +
            "WHERE prof.professorId = :professorId " +
            "AND pa.status = :status")
    List<ProjectApplications> findByProfessorIdAndStatus(
            @Param("professorId") Long professorId,
            @Param("status") ApplicationStatus status
    );


    // Count TEAM_CONFIRMED applications for a professor
    @Query("SELECT COUNT(pa) FROM ProjectApplications pa " +
            "WHERE pa.project.professor.professorId = :professorId " +
            "AND pa.status = 'TEAM_CONFIRMED'")
    Long countTeamConfirmedByProfessorId(@Param("professorId") Long professorId);
}