package com.selab.backend.services;

import com.selab.backend.auth.JwtService;
import com.selab.backend.models.Student;
import com.selab.backend.repositories.StudentRepository;
import com.selab.backend.student.StudentProfileResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class StudentService {

    private final StudentRepository studentRepository;
    private final JwtService jwtService;

    public StudentProfileResponse getStudentProfile(String token) {
        String username = jwtService.extractUsername(token);
        Student student = studentRepository.findByUserName(username)
                .orElseThrow(() -> new RuntimeException("Student not found"));
        StudentProfileResponse resp = new StudentProfileResponse();
        resp.setName(student.getName());
        resp.setCollegeEmailId(student.getCollegeEmailId());
        resp.setDepartmentName(student.getDepartmentName());
        resp.setRollNumber(student.getRollNumber());
        resp.setResumePath(student.getResumePath());
        return resp;
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
