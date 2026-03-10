package com.selab.backend.services;

import com.selab.backend.Dto.CreateProfileRequest;
import com.selab.backend.auth.JwtService;
import com.selab.backend.exceptions.UserNotFoundException;
import com.selab.backend.models.Role;
import com.selab.backend.models.Student;
import com.selab.backend.models.User;
import com.selab.backend.repositories.StudentRepository;
import com.selab.backend.repositories.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class StudentService {

    private final StudentRepository studentRepository;
    private final JwtService jwtService;
    private final UserRepository userRepository;

    public Student getStudentProfile(User user) {
        return studentRepository.findByUser(user).orElseThrow(()-> new UserNotFoundException("profile for user with name"+user.getUsername()+" not found"));
    }

    @Transactional
    public Student createStudent(CreateProfileRequest createProfileRequest , User user) {
         user.setRole(Role.STUDENT);
         userRepository.save(user);
         Student student= Student.builder()
                 .name(createProfileRequest.getName())
                 .departmentName(createProfileRequest.getDepartmentName())
                 .collegeEmailId(createProfileRequest.getCollegeEmailId())
                 .rollNumber(createProfileRequest.getRollNo())
                 .resumePath(createProfileRequest.getResumePath())
                 .profilePhotoLink(createProfileRequest.getProfilePhotoLink())
                 .user(user)
                 .build();
        return studentRepository.save(student);
    }

    public Student getStudentById(Long id) {
        return studentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Student not found"));
    }

    public List<Student> getAllStudents() {
        return studentRepository.findAll();
    }
}
