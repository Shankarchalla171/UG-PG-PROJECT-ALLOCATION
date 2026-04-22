package com.selab.backend.controller;


import com.selab.backend.Dto.*;
import com.selab.backend.mappers.ProfessorMapper;
import com.selab.backend.models.Professor;
import com.selab.backend.models.Role;
import com.selab.backend.models.User;
import com.selab.backend.repositories.ProfessorRepository;
import com.selab.backend.services.ApplicationService;
import com.selab.backend.services.ConfirmationService;
import com.selab.backend.services.ProfessorService;
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

import java.util.List;

@RestController
@RequestMapping("/api/professors")
@RequiredArgsConstructor
public class ProfessorController {

    private final ProfessorService professorService;
    private final ProfessorMapper professorMapper;
    private final ConfirmationService confirmationService;
    private final ApplicationService applicationService;
    private final ProfessorRepository professorRepository;

    @PostMapping("/profile")
    public ResponseEntity<Role> createProfile(@ModelAttribute @Valid ProfCreateProfileRequest profileRequest, @AuthenticationPrincipal User user){
         Professor professor= professorService.createProfile(profileRequest,user);
        return  new ResponseEntity<>(professor.getUser().getRole(), HttpStatus.OK);
    }

    @GetMapping("/profile")
    public ResponseEntity<ProfDto> getProfile(@AuthenticationPrincipal User user){
        Professor profProfile=professorService.getProfile(user);
        return new ResponseEntity<>(professorMapper.toDto(profProfile),HttpStatus.OK);
    }

    @PatchMapping
    public ResponseEntity<ProfDto> updateProfile(@AuthenticationPrincipal User user, @ModelAttribute@Valid UpdateProfileRequest request){
        Professor updatedProf = professorService.update(user, request);
        return new ResponseEntity<>(professorMapper.toDto(updatedProf),HttpStatus.OK);
    }

    @GetMapping("/{projectId}/available-professors")
    public ResponseEntity<List<ProfessorSlotListingDto>> getAllUsingSlotsLeft(@AuthenticationPrincipal User user,@PathVariable Long projectId){
        List<Professor> professors=professorService.filterBySlots(projectId,user);
        List<ProfessorSlotListingDto> professorSlotListingDtos=professors.stream().map(professorMapper::toSlotsDto).toList();
        return new ResponseEntity<>(professorSlotListingDtos, HttpStatus.OK);
    }

    @GetMapping("/dashboard")
    public ResponseEntity<ProfDashboardDto> getDashboard(@AuthenticationPrincipal User user){
        return new ResponseEntity<>(professorService.getDashboard(user),HttpStatus.OK);
    }

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

        applicationService.accept(id);

        return "Application accepted";
    }

    @PutMapping("/applications/{id}/reject")
    public String rejectApplication(@PathVariable Long id){

        applicationService.rejectApplication(id);

        return "Application rejected";
    }

    @GetMapping("/slots")
    public Double getSlotsLeft(@AuthenticationPrincipal User user){
        return professorService.getSlotsLeft(user);
    }
}
