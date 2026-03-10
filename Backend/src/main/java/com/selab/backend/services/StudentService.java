package com.selab.backend.services;

import com.selab.backend.auth.JwtService;
import com.selab.backend.exceptions.UserNotFoundException;
import com.selab.backend.models.Student;
import com.selab.backend.models.User;
import com.selab.backend.repositories.StudentRepository;
import com.selab.backend.repositories.UserRepository;
import com.selab.backend.student.StudentProfileResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class StudentService {

    private final StudentRepository studentRepository;
    private final JwtService jwtService;
    private final UserRepository userRepository;

    public Student getStudentProfile(User user) {
        return studentRepository.findByUser(user).orElseThrow(()-> new UserNotFoundException("profile for user with name"+user.getUsername()+" not found"));
    }

    public Student createStudent(Student student) {
        return studentRepository.save(student);
    }

    public Student getStudentById(Long id) {
        return studentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Student not found"));
    }

    public List<Student> getAllStudents() {
        return studentRepository.findAll();
    }
}
