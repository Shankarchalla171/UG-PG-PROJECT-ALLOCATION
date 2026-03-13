package com.selab.backend.repositories;

import com.selab.backend.models.Student;
import com.selab.backend.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.OptionalInt;

public interface StudentRepository extends JpaRepository<Student, Long> {
    Optional<Student> findByRollNumber(String rollNumber);
    Optional<Student> findByCollegeEmailId(String email);
    Optional<Student> findByUser(User user);
    Optional<Student> findByStudentId(Long id);
}
