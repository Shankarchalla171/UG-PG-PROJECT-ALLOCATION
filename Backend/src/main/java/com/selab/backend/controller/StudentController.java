package com.selab.backend.controller;


import com.selab.backend.models.Student;
import com.selab.backend.services.StudentService;
import com.selab.backend.student.StudentProfileResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/students")
public class StudentController {
    private StudentService studentService;

    @GetMapping("/profile")
    public ResponseEntity<StudentProfileResponse> getStudentProfile(String  token) {
        return ResponseEntity.ok(studentService.getStudentProfile(token));
    }

}
