package com.selab.backend.services;

import com.selab.backend.auth.JwtService;
import com.selab.backend.models.DeptCoordinator;
import com.selab.backend.models.Role;
import com.selab.backend.models.User;
import com.selab.backend.repositories.AdminRepository;
import com.selab.backend.repositories.DeptCoordinatorRepo;
import com.selab.backend.repositories.ProfessorRepository;
import com.selab.backend.repositories.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService {
    private final StudentRepository studentRepo;
    private final ProfessorRepository professorRepo;
    private final DeptCoordinatorRepo coordinatorRepo;
    public Object getUser(User userDetails) {
        if(userDetails.getRole().equals(Role.STUDENT)) {
            return studentRepo.findById(userDetails.getId()).get();
        }
        else if(userDetails.getRole().equals(Role.PROFF)) {
            return professorRepo.findByEmail(userDetails.getEmail()).get();
        }
        else if(userDetails.getRole().equals(Role.ADMIN)) {
            return coordinatorRepo.findByEmail(userDetails.getEmail());
        }
        return null;
    }
}
