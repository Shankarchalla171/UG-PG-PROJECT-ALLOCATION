package com.selab.backend.services;

import com.selab.backend.Dto.StudentCreateProfileRequest;
import com.selab.backend.auth.JwtService;
import com.selab.backend.exceptions.UserNotFoundException;
import com.selab.backend.models.Role;
import com.selab.backend.models.Student;
import com.selab.backend.models.User;
import com.selab.backend.repositories.StudentRepository;
import com.selab.backend.repositories.UserRepository;
import com.selab.backend.utils.FileValidator;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
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
    public Student createStudent(StudentCreateProfileRequest studentCreateProfileRequest, User user) {
        String baseDir = System.getProperty("user.dir") + File.separator+"uploads"+File.separator;
        String resumeDir = baseDir + "resume"+File.separator;
        String profilePhotoDir = baseDir + "profilePhoto"+File.separator;

        MultipartFile photo=studentCreateProfileRequest.getProfilePhoto();
        MultipartFile resume=studentCreateProfileRequest.getResume();

        FileValidator.validateImage(photo,2 * 1024 * 1024);//2MB;
        FileValidator.validatePdf(resume, 5 * 1024 * 1024);//5MB

        try{
            new File(resumeDir).mkdirs();
            new File(profilePhotoDir).mkdirs();

            String resumeName=user.getId()+"_"+resume.getOriginalFilename();
            String resumePath=resumeDir+resumeName;
            String relativeResumePath="uploads"+File.separator+"resume"+File.separator+resumeName;

            String profilePhotoName=user.getId()+"_"+photo.getOriginalFilename();
            String profilePhotoPath=profilePhotoDir+profilePhotoName;
            String relativePhotoPath="uploads"+File.separator+"profilePhoto"+File.separator+profilePhotoName;

            resume.transferTo(new File(resumePath));
            photo.transferTo(new File(profilePhotoPath));

            user.setRole(Role.STUDENT);
            userRepository.save(user);

            Student student= Student.builder()
                    .name(studentCreateProfileRequest.getName())
                    .departmentName(studentCreateProfileRequest.getDepartmentName())
                    .collegeEmailId(studentCreateProfileRequest.getCollegeEmailId())
                    .rollNumber(studentCreateProfileRequest.getRollNo())
                    .resumePath(relativeResumePath)
                    .profilePhotoLink(relativePhotoPath)
                    .user(user)
                    .build();
            return studentRepository.save(student);

        } catch (Exception e) {
            throw new RuntimeException(e.getMessage());
        }
    }

    public Student getStudentById(Long id) {
        return studentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Student not found"));
    }

    public List<Student> getAllStudents() {
        return studentRepository.findAll();
    }
}
