package com.selab.backend.repositories;

import com.selab.backend.models.Professor;
import com.selab.backend.models.Project;
import com.selab.backend.models.User;
import org.springframework.data.domain.Limit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ProfessorRepository extends JpaRepository<Professor,Long> {
    Optional<Professor> findByUser(User user);
    Optional<Professor> findByUserId(Long userID);
    List<Professor> findByDepartmentName(String departmentName);

    Optional<Professor> findByProfessorId(Long professorId);
    List<Professor> findAllByStudentsTakenLessThanEqual(Long allowed);

    @Query("""
        SELECT p FROM Professor p
        LEFT JOIN Collaboration c
            ON c.receiver = p AND c.project = :project
        WHERE c.id IS NULL
        AND p.studentsTaken <= :allowed
   """)
    List<Professor> findAllAvailableForProject(
            @Param("project") Project project,
            @Param("allowed") Long allowed
    );

    @Query("select p.email from Professor p ")
    List<String> getAllEmails();
}
