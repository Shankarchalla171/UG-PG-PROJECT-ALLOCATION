package com.selab.backend.controller;


import com.selab.backend.Dto.ProjectRequestDto;
import com.selab.backend.Dto.ProjectResponseDto;
import com.selab.backend.Dto.ProjectUpdateDto;
import com.selab.backend.mappers.ProjectMapper;
import com.selab.backend.models.Project;
import com.selab.backend.models.User;
import com.selab.backend.services.ProjectService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.nio.file.AccessDeniedException;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("api/projects")
public class ProjectController {
    private final ProjectService projectService;
    private final ProjectMapper projectMapper;

    @PostMapping
    public ResponseEntity<ProjectResponseDto> createProject(
            @Valid @RequestBody ProjectRequestDto projectRequestDto,
            @AuthenticationPrincipal  User currentUser
            ){
        ProjectResponseDto createdProject = projectService.createProject(
                projectRequestDto,
                currentUser
        );

        return new ResponseEntity<>(createdProject, HttpStatus.CREATED);
    }

    //  GET project by ID
    @GetMapping("/{id}")
    public ResponseEntity<ProjectResponseDto> getProjectById(@PathVariable Long id) {
        ProjectResponseDto project = projectService.getProjectById(id);
        return ResponseEntity.ok(project);
    }

    // GET all projects/ projects having a keyword
    @GetMapping
    public ResponseEntity<List<ProjectResponseDto>> getProjects(
            @RequestParam(required = false) String search) {

        List<ProjectResponseDto> projects;

        if (search != null && !search.isEmpty()) {
            projects = projectService.searchProjects(search);
        } else {
            projects = projectService.getAllProjects();
        }

        return ResponseEntity.ok(projects);
    }


    @GetMapping("/professor/{professorId}")
    public ResponseEntity<List<ProjectResponseDto>> getProjectsByProfessorId(
            @PathVariable Long professorId) {
        List<ProjectResponseDto> projects = projectService.getProjectsByProfessorId(professorId);
        return ResponseEntity.ok(projects);
    }

    //  GET projects by professor (from token)
    @GetMapping("/professor/my-projects")
    public ResponseEntity<List<ProjectResponseDto>> getMyProjects(
            @AuthenticationPrincipal User currentUser) {
        List<ProjectResponseDto> projects = projectService.getAllProjectsByProfessor(currentUser);
        return ResponseEntity.ok(projects);
    }

    /**
     * SINGLE UPDATE ENDPOINT - Handles both full and partial updates
     * Uses PATCH method with optional fields
     */
    @PatchMapping("/{id}")
    public ResponseEntity<ProjectResponseDto> updateProject(
            @PathVariable Long id,
            @RequestBody ProjectUpdateDto updateDto,  // All fields optional
            @AuthenticationPrincipal User currentUser) {

        ProjectResponseDto updatedProject = projectService.updateProject(
                id, updateDto, currentUser);

        return ResponseEntity.ok(updatedProject);
    }

    /**
     * DELETE a project by ID
     * Only the professor who owns the project can delete it
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProject(
            @PathVariable Long id,
            @AuthenticationPrincipal User currentUser) {

        projectService.deleteProject(id, currentUser);
        return ResponseEntity.noContent().build();  // 204 No Content
    }

}

