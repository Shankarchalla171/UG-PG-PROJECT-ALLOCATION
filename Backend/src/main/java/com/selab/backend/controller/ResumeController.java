package com.selab.backend.controller;

import com.selab.backend.models.*;
import com.selab.backend.repositories.ProjectApplicationsRepository;
import com.selab.backend.repositories.ProfessorRepository;
import com.selab.backend.repositories.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.data.domain.Pageable;
import org.springframework.http.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.nio.file.Path;
import java.nio.file.Paths;

@RestController
@RequestMapping("/api/resumes")
@RequiredArgsConstructor
public class ResumeController {

    private final StudentRepository studentRepository;
    private final ProjectApplicationsRepository projectApplicationsRepository;
    private final ProfessorRepository professorRepository;

    @GetMapping("/{studentId}")
    public ResponseEntity<Resource> getResume(
            @PathVariable Long studentId,
            @AuthenticationPrincipal User user
    ) {

        // Get professor
        Professor professor = professorRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Professor not found"));

        // Get student
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        Team team = student.getTeam();

        // If student has no team
        if (team == null) {
            throw new RuntimeException("Student not part of any team");
        }

        // Check if this team applied to any project of this professor
        boolean allowed = projectApplicationsRepository
                .existsByTeamAndProject_Professor(team, professor);

        if (!allowed) {
            throw new RuntimeException("Access denied");
        }

        // Get file path
        Path filePath = Paths.get(student.getResumePath())
                .toAbsolutePath()
                .normalize();

        System.out.println("Resolved path: " + filePath);

        try {
            Resource resource = new UrlResource(filePath.toUri());

            if (!resource.exists()) {
                throw new RuntimeException("File not found");
            }

            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_PDF)
                    .body(resource);

        } catch (Exception e) {
            throw new RuntimeException("Error loading file");
        }
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<Resource> getResumeForStudent(
            @PathVariable Long studentId,
            @AuthenticationPrincipal User user
    ) {

        // Get logged-in student
        Student loggedInStudent = studentRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        // Get requested student
        Student targetStudent = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        // Check if both belong to same team
        if (loggedInStudent.getTeam() == null ||
                targetStudent.getTeam() == null ||
                !loggedInStudent.getTeam().getTeamId().equals(targetStudent.getTeam().getTeamId())) {

            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        }

        // Load file
        Path filePath = Paths.get(targetStudent.getResumePath())
                .toAbsolutePath()
                .normalize();

        try {
            Resource resource = new UrlResource(filePath.toUri());

            if (!resource.exists()) {
                throw new RuntimeException("File not found");
            }

            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_PDF)
                    .body(resource);

        } catch (Exception e) {
            throw new RuntimeException("Error loading file");
        }
    }
}