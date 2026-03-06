package com.selab.backend.controller;

import com.selab.backend.auth.JwtService;
import com.selab.backend.models.Student;
import com.selab.backend.services.StudentService;
import com.selab.backend.student.StudentProfileResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/students")
@RequiredArgsConstructor
public class StudentController {
    private final StudentService studentService;
    private final JwtService jwtService;

    @PostMapping("/profile")
    public ResponseEntity<Student> createStudent(@RequestBody Student student) {
        Student created = studentService.createStudent(student);
        return ResponseEntity.ok(created);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Student> getStudentById(@PathVariable Long id) {
        return ResponseEntity.ok(studentService.getStudentById(id));
    }

    @GetMapping
    public ResponseEntity<List<Student>> getAllStudents() {
        return ResponseEntity.ok(studentService.getAllStudents());
    }

    @GetMapping("/profile")
    public ResponseEntity<StudentProfileResponse> getStudentProfile(
            @RequestHeader("Authorization") String authorizationHeader) {
        if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
            return ResponseEntity.badRequest().build();
        }
        String token = authorizationHeader.substring(7);
        return ResponseEntity.ok(studentService.getStudentProfile(token));
    }
}
