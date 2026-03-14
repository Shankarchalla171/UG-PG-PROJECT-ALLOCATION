package com.selab.backend.services;

import com.selab.backend.Dto.ProfCreateProfileRequest;
import com.selab.backend.Dto.ProfDto;
import com.selab.backend.Dto.UpdateProfileRequest;
import com.selab.backend.exceptions.UserNotFoundException;
import com.selab.backend.mappers.ProfessorMapper;
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
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@Service
@RequiredArgsConstructor
public class ProfessorService {
    private final ProfessorRepository professorRepository;
    private final UserRepository userRepository;
    private final ProfessorMapper professorMapper;

    public Professor createProfile(@Valid ProfCreateProfileRequest profileRequest, User user) {
        String baseDir = System.getProperty("user.dir") + File.separator+"uploads"+File.separator;
        String profilePhotoDir = baseDir + "profilePhoto"+File.separator;


        MultipartFile photo=profileRequest.getProfilePhoto();
        FileValidator.validateImage(photo,3 * 1024 * 1024);//2mb

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

    public Professor getProfile(User user) {

        return professorRepository.findByUser(user).orElseThrow(() -> new UserNotFoundException("user with email " + user.getEmail() + " not found"));
    }

    public Professor update(User user, UpdateProfileRequest request) {
        String baseDir = System.getProperty("user.dir") + File.separator+"uploads";
        String profilePhotoDir = baseDir+File.separator + "profilePhoto";

        Professor prof= professorRepository.findByUser(user).orElseThrow(()-> new UserNotFoundException("user with "+user.getUsername()+"  not found"));

        if(request.getProfilePhoto() != null && !request.getProfilePhoto().isEmpty()){
            MultipartFile photo=request.getProfilePhoto();

            FileValidator.validateImage(photo, 3 * 1024 * 1024);

           try{
               if(prof.getProfilePhotoPath() != null){
                   Path oldFile= Paths.get(System.getProperty("user.dir"),prof.getProfilePhotoPath());
                   Files.deleteIfExists(oldFile);
               }

               String fileName=user.getId()+"_"+photo.getOriginalFilename();
               Path filePath=Paths.get(profilePhotoDir,fileName);
               String relativePath="uploads/profilePhoto/"+fileName;

               photo.transferTo(filePath);
               prof.setProfilePhotoPath(relativePath);
           } catch (Exception e) {
               throw new RuntimeException(e.getMessage());
           }
        }
        professorMapper.updateProf(request,prof);
        return professorRepository.save(prof);
    }
}