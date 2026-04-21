package com.selab.backend.repositories;

import com.selab.backend.models.Student;
import com.selab.backend.models.Team;
import com.selab.backend.models.TeamRole;
import com.selab.backend.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.OptionalInt;
import java.util.UUID;

public interface StudentRepository extends JpaRepository<Student, Long> {
    Optional<Student> findByRollNumber(String rollNumber);
    Optional<Student> findByCollegeEmailId(String email);
    Optional<Student> findByUser(User user);
    Optional<Student> findByStudentId(Long id);
    Optional<Student> findByUserId(Long userId);

    @Query("select s from Student s where s.team = :team and s.teamRole = :role")
    Optional<Student> findByTeamAndTeamRole(@Param("team") Team team,
                                            @Param("role") TeamRole role);

    @Query("select  s.collegeEmailId  from Student s where s.departmentName= :departmentName and s.rollNumber like :batch")
    List<String>   getAllEmailsByDepartmentNameAndBatch(String departmentName,String batch);




    long count();

    @Query("SELECT COUNT(s) FROM Student s WHERE s.departmentName = :department")
    Long countByDepartment(@Param("department") String department);

    @Query("SELECT COUNT(s) FROM Student s WHERE s.departmentName = :department AND SUBSTRING(s.rollNumber, 1, 3) = :batch")
    Long countByDepartmentAndBatch(@Param("department") String department, @Param("batch") String batch);

    @Query("SELECT DISTINCT SUBSTRING(s.rollNumber, 1, 3) FROM Student s WHERE s.departmentName = :department ORDER BY SUBSTRING(s.rollNumber, 1, 3) DESC")
    Optional<String> findLatestBatchByDepartment(@Param("department") String department);



}
