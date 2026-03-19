package com.selab.backend.controller;

import com.selab.backend.Dto.ProjectListingDto;
import com.selab.backend.models.Student;
import com.selab.backend.models.User;
import com.selab.backend.repositories.StudentRepository;
import com.selab.backend.services.ProjectService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/student")
@RequiredArgsConstructor
public class ProjectsNotAppliedController {

    private final ProjectService projectService;
    private final StudentRepository studentRepository;

    @GetMapping("/projects")
    public List<ProjectListingDto> getProjects(@AuthenticationPrincipal User user) {
        Student student = studentRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Student not found"));
        return projectService.getProjectListings(student);
    }
}