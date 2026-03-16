package com.selab.backend.controller;

import com.selab.backend.Dto.StudentApplicationDto;
import com.selab.backend.models.Student;
import com.selab.backend.models.User;
import com.selab.backend.repositories.StudentRepository;
import com.selab.backend.services.ApplicationService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.PageRequest;

@RestController
@RequestMapping("/api/students")
@RequiredArgsConstructor
public class StudentApplicationController {

    private final ApplicationService applicationService;
    private final StudentRepository studentRepository;

    @GetMapping("/applications")
    public Page<StudentApplicationDto> getApplications(
            @AuthenticationPrincipal User user,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size
    ){

        Student student = studentRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        Pageable pageable = PageRequest.of(page, size);

        return applicationService.getApplications(student, pageable);
    }
}