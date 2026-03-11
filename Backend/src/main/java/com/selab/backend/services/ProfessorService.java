package com.selab.backend.services;

import com.selab.backend.Dto.ProfCreateProfileRequest;
import com.selab.backend.Dto.ProfProfileResponse;
import com.selab.backend.exceptions.UserNotFoundException;
import com.selab.backend.models.Professor;
import com.selab.backend.models.Role;
import com.selab.backend.models.User;
import com.selab.backend.repositories.ProfessorRepository;
import com.selab.backend.repositories.UserRepository;
import com.selab.backend.utils.FileValidator;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;

@Service
@RequiredArgsConstructor
public class ProfessorService {
    private final ProfessorRepository professorRepository;
    private final UserRepository userRepository;

    public Professor createProfile(@Valid ProfCreateProfileRequest profileRequest, User user) {
        String baseDir = System.getProperty("user.dir") + File.separator+"uploads"+File.separator;
        String profilePhotoDir = baseDir + "profilePhoto"+File.separator;


        MultipartFile photo=profileRequest.getProfilePhoto();
        FileValidator.validateImage(photo,2 * 1024 * 1024);//2mb

        try{
            new File(profilePhotoDir).mkdirs();

            String profilePhotoName=user.getId()+"-"+photo.getOriginalFilename();
            String profilePhotoPath=profilePhotoDir+profilePhotoName;
            String relativePath="uploads/profilePhoto/"+profilePhotoName;
            photo.transferTo(new File(profilePhotoPath));


            user.setRole(Role.PROFF);
            userRepository.save(user);
            Professor professor=Professor.builder()
                    .name(profileRequest.getName())
                    .email(profileRequest.getEmail())
                    .domain(profileRequest.getDomain())
                    .departmentName(profileRequest.getDepartmentName())
                    .googleScholarLink(profileRequest.getGoogleScholarLink())
                    .officeNumber(profileRequest.getOfficeNumber())
                    .profilePhotoPath(relativePath)
                    .user(user)
                    .build();
            return professorRepository.save(professor);

        } catch (Exception e) {
            throw new RuntimeException(e.getMessage());
        }
    }

    public ProfProfileResponse getProfile(User user) {
        Professor professor = professorRepository.findByUser(user).orElseThrow(() -> new UserNotFoundException("user with email " + user.getEmail() + " not found"));
        ProfProfileResponse profile = ProfProfileResponse.builder()
                .name(professor.getName())
                .email(professor.getEmail())
                .officeNumber(professor.getOfficeNumber())
                .googleScholarLink(professor.getGoogleScholarLink())
                .domain(professor.getDomain())
                .departmentName(professor.getDepartmentName())
                .build();
        return profile;
    }
}