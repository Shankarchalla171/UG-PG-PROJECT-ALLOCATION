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
import java.util.Set;
import java.util.UUID;
//import java.util.UUID;

public interface ProjectApplicationsRepository extends JpaRepository<ProjectApplications, Long> {

    Optional<ProjectApplications> findByTeamAndProject(Team team, Project project);
    Page<ProjectApplications> findByTeam(Team team, Pageable pageable);
    Page<ProjectApplications> findByProject_Professor(Professor professor, Pageable pageable);
    boolean existsByTeamAndProject_Professor(Team team, Professor professor);
    boolean existsByProjectAndTeam(Project project, Team team);
    boolean existsByTeamAndStatus(Team team, ApplicationStatus status);
    Page<ProjectApplications> findByProject_ProfessorAndStatusIn(
            Professor professor,
            List<ApplicationStatus> statuses,
            Pageable pageable
    );

    @Query("""
    SELECT pa.project.projectId, COUNT(pa)
    FROM ProjectApplications pa
    WHERE pa.project.projectId IN :projectIds
    GROUP BY pa.project.projectId
""")
    List<Object[]> countApplicationsByProjectIds(@Param("projectIds") List<Long> projectIds);

    @Query("""
    SELECT pa.project.projectId 
    FROM ProjectApplications pa 
    WHERE pa.team = :team
""")
    Set<Long> findProjectIdsByTeam(@Param("team") Team team);

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
    WHERE pa.status = :status
""")

    Optional<ProjectApplications> findByAppliedProjectsId(Long appliedProjectsId);

    Page<ProjectApplications> findByProject_ProjectIdAndProject_Professor(
            Long projectId,
            Professor professor,
            Pageable pageable
    );

    Page<ProjectApplications> findByProject_ProjectIdAndProject_ProfessorAndStatusIn(
            Long projectId,
            Professor professor,
            List<ApplicationStatus> statuses,
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

    List<ProjectApplications> findByStatus(ApplicationStatus status);



    // Native query methods for reliability
    @Query(value = "SELECT COUNT(DISTINCT s.student_id) FROM students s " +
            "JOIN teams t ON s.team_id = t.team_id " +
            "JOIN project_applications pa ON t.team_id = pa.team_id " +
            "WHERE pa.status = 'CONFIRMED' " +
            "AND s.department_name = :department " +
            "AND SUBSTRING(s.roll_number, 1, 3) = :batch",
            nativeQuery = true)
    Long countAllocatedStudentsByDepartmentAndBatchNative(
            @Param("department") String department,
            @Param("batch") String batch);

    @Query(value = "SELECT COUNT(DISTINCT s.student_id) FROM students s " +
            "JOIN teams t ON s.team_id = t.team_id " +
            "JOIN project_applications pa ON t.team_id = pa.team_id " +
            "WHERE pa.status = 'CONFIRMED' " +
            "AND s.department_name = :department",
            nativeQuery = true)
    Long countAllocatedStudentsByDepartmentNative(@Param("department") String department);

    @Query(value = "SELECT COUNT(*) FROM project_applications pa " +
            "JOIN projects p ON pa.project_id = p.project_id " +
            "JOIN professors prof ON p.professor_id = prof.professor_id " +
            "WHERE pa.status = 'PENDING' " +
            "AND prof.department_name = :department " +
            "AND SUBSTRING((SELECT s.roll_number FROM students s " +
            "JOIN teams t ON s.team_id = t.team_id " +
            "WHERE t.team_id = pa.team_id LIMIT 1), 1, 3) = :batch",
            nativeQuery = true)
    Long countPendingAllocationsByDepartmentAndBatchNative(
            @Param("department") String department,
            @Param("batch") String batch);

    @Query(value = "SELECT COUNT(*) FROM project_applications pa " +
            "JOIN projects p ON pa.project_id = p.project_id " +
            "JOIN professors prof ON p.professor_id = prof.professor_id " +
            "WHERE pa.status = 'PENDING' " +
            "AND prof.department_name = :department",
            nativeQuery = true)
    Long countPendingAllocationsByDepartmentNative(@Param("department") String department);
}