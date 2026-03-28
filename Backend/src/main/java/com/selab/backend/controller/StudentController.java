package com.selab.backend.controller;

import com.selab.backend.Dto.StudentProfileRequest;
import com.selab.backend.Dto.StudentDto;
import com.selab.backend.Dto.TeamDto;
import com.selab.backend.Dto.UpdateProfileRequest;
import com.selab.backend.mappers.StudentMapper;
import com.selab.backend.models.Role;
import com.selab.backend.models.Student;
import com.selab.backend.models.User;
import com.selab.backend.services.ProjectService;
import com.selab.backend.services.StudentService;
import com.selab.backend.repositories.StudentRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/students")
@RequiredArgsConstructor
public class StudentController {
    private final StudentService studentService;
    private final StudentMapper studentMapper;
    private final StudentRepository studentRepository;
    private final ProjectService projectService;

    @PostMapping("/profile")
    public ResponseEntity<Role> createStudent(@ModelAttribute @Valid StudentProfileRequest studentCreateProfileRequest, @AuthenticationPrincipal User user) {
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
    public ResponseEntity<StudentDto> getStudentProfile(@AuthenticationPrincipal User user) {
        System.out.println("controller reached");
        Student student = studentService.getStudentProfile(user);
        return new ResponseEntity<>(studentMapper.toDto(student), HttpStatus.OK);
    }

    @PatchMapping
    public ResponseEntity<StudentDto> updateStudent(@ModelAttribute@Valid  UpdateProfileRequest request, @AuthenticationPrincipal User user){
        Student updatedStudent=studentService.update(request,user);
        return new ResponseEntity<>(studentMapper.toDto(updatedStudent),HttpStatus.OK);
    }

    @GetMapping("/team-details")
    public TeamDto getTeamDetails(@AuthenticationPrincipal User user){

        Student student = studentRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        return studentService.getTeamDetails(student);
    }

    @GetMapping("/projects/filters")
    public ResponseEntity<Map<String, List<String>>> getProjectFilters(
            @AuthenticationPrincipal User user
    ) {

        Student student = studentRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        return ResponseEntity.ok(projectService.getProjectFilters(student));
    }
}
