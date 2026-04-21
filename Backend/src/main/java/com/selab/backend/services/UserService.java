package com.selab.backend.services;

import com.selab.backend.Dto.AdminCreateUserRequest;
import com.selab.backend.Dto.AdminUserResponse;
import com.selab.backend.exceptions.ConflictException;
import com.selab.backend.exceptions.ForbiddenException;
import com.selab.backend.exceptions.NotFoundException;
import com.selab.backend.exceptions.UnprocessableEntityException;
import com.selab.backend.models.*;
import com.selab.backend.repositories.DeptCoordinatorRepository;
import com.selab.backend.repositories.ProfessorRepository;
import com.selab.backend.repositories.StudentRepository;
import com.selab.backend.repositories.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Sort;
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

    public List<AdminUserResponse> getAllUsers(Role role, String sortBy, String direction) {

        // ✅ 1. Validate sort field (prevents crashes like departmentName issue)
        List<String> allowedFields = List.of("email", "role");

        if (sortBy == null || !allowedFields.contains(sortBy)) {
            sortBy = "email"; // better UX default than "id"
        }

        // ✅ 2. Normalize direction (avoid null / invalid values)
        if (direction == null || (!direction.equalsIgnoreCase("asc") && !direction.equalsIgnoreCase("desc"))) {
            direction = "asc";
        }

        // ✅ 3. Create Sort object (DB-level sorting)
        Sort sort = direction.equalsIgnoreCase("desc") ?
                Sort.by(sortBy).descending() :
                Sort.by(sortBy).ascending();

        List<User> users;

        // ✅ 4. Apply role filter (if provided)
        if (role != null) {
            users = userRepository.findByRole(role, sort);
        } else {
            users = userRepository.findAll(sort);
        }

        // ✅ 5. Convert to DTO (adds departmentName logic)
        return users.stream()
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
                .orElseThrow(() -> new NotFoundException("User not found"));

        if (user.getRole() == Role.ADMIN) {
            throw new ForbiddenException(
                    "Administrator accounts cannot be deleted"
            );
        }

        try {
            deptCoordinatorRepository.findByUserId(id)
                    .ifPresent(deptCoordinatorRepository::delete);

            professorRepository.findByUserId(id)
                    .ifPresent(professorRepository::delete);

            studentRepository.findByUserId(id)
                    .ifPresent(studentRepository::delete);

            userRepository.delete(user);

        } catch (DataIntegrityViolationException ex) {
            throw new ConflictException(
                    "This user cannot be deleted because related records exist"
            );
        }
    }


    public void makeCoordinator(Long userId, String deptName, String batch) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found"));

        if (user.getRole() == Role.ADMIN) {
            throw new ForbiddenException("Administrator accounts cannot be modified");
        }

        // 🔴 NEW: Only professors can be made coordinators
        if (user.getRole() != Role.PROFF) {
            throw new UnprocessableEntityException("Only professors can be made into department coordinators");
        }

        // 🔴 Prevent duplicate coordinator entries
        if (deptCoordinatorRepository.findByUserId(userId).isPresent()) {
            throw new ConflictException("User is already a coordinator");
        }

        // 🔴 Enforce ONE coordinator per dept per batch
        //find the existing active coordinator and deactivate him
        DeptCoordinator existingCoordinator = deptCoordinatorRepository.findByDeptNameAndIsActive(deptName,true).orElse(null);

        if(existingCoordinator != null){
            existingCoordinator.setIsActive(false);
            deptCoordinatorRepository.save(existingCoordinator);
        }

        if (deptCoordinatorRepository
                .findByDeptNameAndBatch(deptName, batch)
                .isPresent()) {
            throw new ConflictException(
                    "Coordinator already exists for " + deptName + " in batch " + batch
            );
        }

        // 1. Update role
        user.setRole(Role.DEPTCORDINATOR);
        userRepository.save(user);

        // 2. Insert into dept_coordinator table
        DeptCoordinator coordinator = new DeptCoordinator();
        coordinator.setUser(user);  // JPA handles user_id
        coordinator.setDeptName(deptName);
        coordinator.setBatch(batch);
        coordinator.setIsActive(true);

        deptCoordinatorRepository.save(coordinator);
    }

    public User createUserByAdmin(AdminCreateUserRequest request) {

        // 🔴 Check if user exists
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new ConflictException( "A user with email " + request.getEmail() + " already exists");
        }

        User user = new User();
        user.setUsername(request.getEmail());
        user.setEmail(request.getEmail());
//        user.setPassword(request.getPassword());
        user.setPassword(encoder.encode(request.getPassword()));
//        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(request.getRole());

        return userRepository.save(user);
    }
}