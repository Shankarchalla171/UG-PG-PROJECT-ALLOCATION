package com.selab.backend.controller;

import com.selab.backend.Dto.ProfessorApplicationDto;
import com.selab.backend.models.Professor;
import com.selab.backend.models.User;
import com.selab.backend.repositories.ProfessorRepository;
import com.selab.backend.services.ApplicationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/professor")
@RequiredArgsConstructor
public class ProfessorApplicationController {

    private final ApplicationService applicationService;
    private final ProfessorRepository professorRepository;

    @GetMapping("/applications")
    public Page<ProfessorApplicationDto> getApplications(
            @AuthenticationPrincipal User user,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Long projectId
    ){

        Professor professor = professorRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Professor not found"));

        Pageable pageable = PageRequest.of(page, size, Sort.by("appliedOn").descending());

        return applicationService.getProfessorApplications(professor, status, projectId, pageable);
    }

    @PutMapping("/applications/{id}/review")
    public String addReview(
            @PathVariable Long id,
            @RequestBody String review
    ){
        applicationService.addProfessorReview(id, review);
        return "Review added";
    }

    @PutMapping("/applications/{id}/accept")
    public String acceptApplication(@PathVariable Long id){

        applicationService.acceptApplication(id);

        return "Application accepted";
    }

    @PutMapping("/applications/{id}/reject")
    public String rejectApplication(@PathVariable Long id){

        applicationService.rejectApplication(id);

        return "Application rejected";
    }
}