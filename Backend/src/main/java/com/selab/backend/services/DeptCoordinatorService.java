package com.selab.backend.services;

import com.selab.backend.exceptions.UserNotFoundException;
import com.selab.backend.models.DeptCoordinator;
import com.selab.backend.models.Professor;
import com.selab.backend.models.Role;
import com.selab.backend.models.User;
import com.selab.backend.repositories.DeptCoordinatorRepository;
import com.selab.backend.repositories.ProfessorRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class DeptCoordinatorService {
    private final ProfessorRepository professorRepository;
    private final DeptCoordinatorRepository deptCoordinatorRepository;


    public void setFacultyLimit(User user, Long limit) {
        if(!user.getRole().equals(Role.DEPTCORDINATOR))
             throw new RuntimeException("only deptCoordinator can set the faculty student intake limit");
        DeptCoordinator coordinator=deptCoordinatorRepository.findByUser(user).orElseThrow(()-> new UserNotFoundException("cant find coordinator with the email : "+ user.getEmail()));
        coordinator.setMaxIntake(limit);
    }

    public void setStudentTeamLimit(User user, Long limit) {
        if(!user.getRole().equals(Role.DEPTCORDINATOR))
            throw new RuntimeException("only deptCoordinator can set the faculty student intake limit");
        DeptCoordinator coordinator=deptCoordinatorRepository.findByUser(user).orElseThrow(()-> new UserNotFoundException("cant find coordinator with the email : "+ user.getEmail()));
        coordinator.setMaxTeamSize(limit);
    }
}
