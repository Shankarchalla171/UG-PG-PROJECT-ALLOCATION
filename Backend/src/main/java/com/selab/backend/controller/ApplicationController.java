package com.selab.backend.controller;

import com.selab.backend.Dto.ApplyProjectRequest;
import com.selab.backend.models.*;
import com.selab.backend.repositories.ProjectRepository;
import com.selab.backend.repositories.StudentRepository;
import com.selab.backend.services.ApplicationService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/student")
@RequiredArgsConstructor
public class ApplicationController {

    private final ApplicationService applicationService;
    private final ProjectRepository projectRepository;
    private final StudentRepository studentRepository;

    @PostMapping("/apply")
    public String apply(
            @AuthenticationPrincipal User user,
            @RequestBody ApplyProjectRequest request
    ) {

        Student student = studentRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        if (!student.getTeamRole().equals(TeamRole.TEAMlEAD)) {
            throw new RuntimeException("Only team leader can apply");
        }

        Project project = projectRepository.findById(request.getProjectId())
                .orElseThrow(() -> new RuntimeException("Project not found"));

        applicationService.applyToProject(
                project,
                student.getTeam(),
                request.getMessage()
        );

        return "Application submitted successfully";
    }
}