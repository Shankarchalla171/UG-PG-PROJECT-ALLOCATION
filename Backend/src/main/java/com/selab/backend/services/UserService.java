package com.selab.backend.services;

import com.selab.backend.Dto.AdminCreateUserRequest;
import com.selab.backend.models.DeptCoordinator;
import com.selab.backend.models.Role;
import com.selab.backend.models.User;
import com.selab.backend.repositories.DeptCoordinatorRepository;
import com.selab.backend.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService implements UserDetailsService {

    private final UserRepository userRepository;
    private final DeptCoordinatorRepository deptCoordinatorRepository;
//    private final PasswordEncoder passwordEncoder;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getRole().name().equals("ADMIN")) {
            throw new RuntimeException("Cannot delete admin");
        }

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
            throw new RuntimeException("User already exists");
        }

        User user = new User();
        user.setUsername(request.getUserName());
        user.setEmail(request.getEmail());
        user.setPassword(request.getPassword());
//        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(request.getRole());

        return userRepository.save(user);
    }
}