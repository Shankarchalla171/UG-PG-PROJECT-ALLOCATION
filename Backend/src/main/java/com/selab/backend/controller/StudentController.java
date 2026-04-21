package com.selab.backend.controller;

import com.selab.backend.Dto.*;
import com.selab.backend.mappers.StudentMapper;
import com.selab.backend.models.Role;
import com.selab.backend.models.Student;
import com.selab.backend.models.TeamRole;
import com.selab.backend.models.User;
import com.selab.backend.services.ApplicationService;
import com.selab.backend.services.ProjectService;
import com.selab.backend.services.StudentService;
import com.selab.backend.repositories.StudentRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
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
    private final ApplicationService applicationService;

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

    @GetMapping("/projects")
    public Page<ProjectListingDto> getProjects(
            @AuthenticationPrincipal User user,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,

            @RequestParam(required = false) String search,
            @RequestParam(required = false) String domain,
            @RequestParam(required = false) String faculty,
            @RequestParam(required = false) String slots,
            @RequestParam(required = false) String applicationStatus
    ) {
        Student student = studentRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        Pageable pageable = PageRequest.of(page, size);

        return projectService.getProjectListings(
                student, pageable, search, domain, faculty, slots,applicationStatus
        );
    }

    @GetMapping("/projects/filters")
    public ResponseEntity<Map<String, List<String>>> getProjectFilters(
            @AuthenticationPrincipal User user
    ) {

        Student student = studentRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        return ResponseEntity.ok(projectService.getProjectFilters(student));
    }

    @GetMapping("/dashboard")
    public ResponseEntity<StudentDashboardDto> getDashboard(@AuthenticationPrincipal User user){
        return new ResponseEntity<>(studentService.getDashboard(user),HttpStatus.OK);
    }

    @GetMapping("/applications")
    public Page<StudentApplicationDto> getApplications(
            @AuthenticationPrincipal User user,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size
    ){

        Student student = studentRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        Pageable pageable = PageRequest.of(page, size, Sort.by("appliedOn").descending());

        return applicationService.getApplications(student, pageable);
    }

    @GetMapping("/team-role")
    public ResponseEntity<String> getTeamRole(@AuthenticationPrincipal User user){
        return new ResponseEntity<>(studentService.teamRole(user).toString(),HttpStatus.OK);
    }
}
