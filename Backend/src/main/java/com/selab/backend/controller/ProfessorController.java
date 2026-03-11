package com.selab.backend.controller;


import com.selab.backend.Dto.ProfCreateProfileRequest;
import com.selab.backend.Dto.ProfProfileResponse;
import com.selab.backend.models.Professor;
import com.selab.backend.models.Role;
import com.selab.backend.models.User;
import com.selab.backend.services.ProfessorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/professors")
@RequiredArgsConstructor
public class ProfessorController {

    private final ProfessorService professorService;


    @PostMapping("/profile")
    public ResponseEntity<Role> createProfile(@ModelAttribute @Valid ProfCreateProfileRequest profileRequest, @AuthenticationPrincipal User user){
         Professor professor= professorService.createProfile(profileRequest,user);
        return  new ResponseEntity<>(professor.getUser().getRole(), HttpStatus.OK);
    }

    @GetMapping("/profile")
    public ResponseEntity<ProfProfileResponse> getProfile(@AuthenticationPrincipal User user){
        return new ResponseEntity<>(professorService.getProfile(user),HttpStatus.OK);
    }


}
