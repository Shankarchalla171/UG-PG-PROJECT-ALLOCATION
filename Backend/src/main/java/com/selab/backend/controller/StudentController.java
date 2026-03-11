package com.selab.backend.controller;

import com.selab.backend.Dto.StudentCreateProfileRequest;
import com.selab.backend.auth.JwtService;
import com.selab.backend.mappers.StudentMapper;
import com.selab.backend.models.Role;
import com.selab.backend.models.Student;
import com.selab.backend.models.User;
import com.selab.backend.services.StudentService;
import com.selab.backend.Dto.StudentProfileResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/students")
@RequiredArgsConstructor
public class StudentController {
    private final StudentService studentService;
    private final JwtService jwtService;
    private final StudentMapper studentMapper;

    @PostMapping("/profile")
    public ResponseEntity<Role> createStudent(@ModelAttribute @Valid StudentCreateProfileRequest studentCreateProfileRequest, @AuthenticationPrincipal User user) {
        Student created = studentService.createStudent(studentCreateProfileRequest,user);
        return new ResponseEntity<>(created.getUser().getRole(),HttpStatus.OK);
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
    public ResponseEntity<StudentProfileResponse> getStudentProfile(@AuthenticationPrincipal User user) {
        Student student = studentService.getStudentProfile(user);
        return new ResponseEntity<>(studentMapper.toDto(student), HttpStatus.OK);
    }
}
