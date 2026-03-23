package com.selab.backend.services;

import com.selab.backend.Dto.AdminCreateUserRequest;
import com.selab.backend.Dto.AdminUserResponse;
import com.selab.backend.models.*;
import com.selab.backend.repositories.DeptCoordinatorRepository;
import com.selab.backend.repositories.ProfessorRepository;
import com.selab.backend.repositories.StudentRepository;
import com.selab.backend.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class UserService implements UserDetailsService {

    private final UserRepository userRepository;
    private final DeptCoordinatorRepository deptCoordinatorRepository;
    private final ProfessorRepository professorRepository;
    private final StudentRepository studentRepository;
    private static final PasswordEncoder encoder = new BCryptPasswordEncoder();
//    private final PasswordEncoder passwordEncoder;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
    }

    public List<AdminUserResponse> getAllUsers() {
        return userRepository.findAll()
                .stream()
                .map(this::convertToDTO)
                .toList();
    }

    public AdminUserResponse convertToDTO(User user) {

        String deptName = null;

        switch (user.getRole()) {

            case DEPTCORDINATOR -> {
                deptName = deptCoordinatorRepository.findByUserId(user.getId())
                        .map(DeptCoordinator::getDeptName)
                        .orElse(null);
            }

            case PROFF -> {
                deptName = professorRepository.findByUserId(user.getId())
                        .map(Professor::getDepartmentName)
                        .orElse(null);
            }

            case STUDENT -> {
                deptName = studentRepository.findByUserId(user.getId())
                        .map(Student::getDepartmentName)
                        .orElse(null);
            }

            default -> deptName = null; // USER / ADMIN
        }

        return new AdminUserResponse(
                user.getId(),
                user.getUsername(),   // ⚠️ use correct field name
                user.getEmail(),
                user.getRole().name(),
                deptName
        );
    }

    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getRole().name().equals("ADMIN")) {
            throw new RuntimeException("Cannot delete admin");
        }

        deptCoordinatorRepository.findByUserId(id)
                .ifPresent(deptCoordinatorRepository::delete);

        professorRepository.findByUserId(id)
                .ifPresent(professorRepository::delete);

        studentRepository.findByUserId(id)
                .ifPresent(studentRepository::delete);


        userRepository.delete(user);
    }

    public User assignRole(Long id, Role role) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getRole().name().equals("ADMIN")) {
            throw new RuntimeException("Cannot modify admin");
        }

        user.setRole(role);
        return userRepository.save(user);
    }

    public void makeCoordinator(Long userId, String deptName) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getRole().name().equals("ADMIN")) {
            throw new RuntimeException("Cannot modify admin");
        }

        // 🔴 Prevent duplicate coordinator entries
        if (deptCoordinatorRepository.findByUserId(userId).isPresent()) {
            throw new RuntimeException("User is already a coordinator");
        }

        // 1. Update role
        user.setRole(Role.DEPTCORDINATOR);
        userRepository.save(user);

        // 2. Insert into dept_coordinator table
        DeptCoordinator coordinator = new DeptCoordinator();
        coordinator.setUser(user);  // JPA handles user_id
        coordinator.setDeptName(deptName);

        deptCoordinatorRepository.save(coordinator);
    }

    public User createUserByAdmin(AdminCreateUserRequest request) {

        // 🔴 Check if user exists
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "User already exists"
            );
        }

        User user = new User();
        user.setUsername(request.getUserName());
        user.setEmail(request.getEmail());
//        user.setPassword(request.getPassword());
        user.setPassword(encoder.encode(request.getPassword()));
//        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(request.getRole());

        return userRepository.save(user);
    }
}