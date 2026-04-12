package com.selab.backend.controller;

import com.selab.backend.Dto.ProjectListingDto;
import com.selab.backend.models.Student;
import com.selab.backend.models.User;
import com.selab.backend.repositories.StudentRepository;
import com.selab.backend.services.ProjectService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import org.springframework.data.domain.Pageable;

@RestController
@RequestMapping("/api/student")
@RequiredArgsConstructor
public class ProjectsNotAppliedController {

    private final ProjectService projectService;
    private final StudentRepository studentRepository;

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
}