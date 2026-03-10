package com.selab.backend.services;

import com.selab.backend.Dto.ProfCreateProfileRequest;
import com.selab.backend.exceptions.UserNotFoundException;
import com.selab.backend.models.Professor;
import com.selab.backend.models.Role;
import com.selab.backend.models.User;
import com.selab.backend.repositories.ProfessorRepository;
import com.selab.backend.repositories.UserRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ProfessorService {
    private final ProfessorRepository professorRepository;
    private final UserRepository userRepository;

    public Professor createProfile(@Valid ProfCreateProfileRequest profileRequest, User user) {
        user.setRole(Role.PROFF);
        userRepository.save(user);
        Professor professor=Professor.builder()
                .name(profileRequest.getName())
                .email(profileRequest.getEmail())
                .domain(profileRequest.getDomain())
                .departmentName(profileRequest.getDepartmentName())
                .googleScholarLink(profileRequest.getGoogleScholarLink())
                .officeNumber(profileRequest.getOfficeNumber())
                .user(user)
                .build();
        return professorRepository.save(professor);
    }

    public Professor getProfile(User user) {
        return professorRepository.findByUser(user).orElseThrow(()-> new UserNotFoundException("user with email "+user.getEmail()+" not found"));
    }
}
