package com.selab.backend.services;

import com.selab.backend.Dto.ProfCreateProfileRequest;
import com.selab.backend.Dto.ProfDashboardDto;
import com.selab.backend.Dto.UpdateProfileRequest;
import com.selab.backend.exceptions.ResourceNotFoundException;
import com.selab.backend.exceptions.UserNotFoundException;
import com.selab.backend.mappers.ProfessorMapper;
import com.selab.backend.models.*;
import com.selab.backend.repositories.*;
import com.selab.backend.utils.FileValidator;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ProfessorService {
    private final ProfessorRepository professorRepository;
    private final UserRepository userRepository;
    private final ProjectRepository projectRepository;
    private final ProfessorMapper professorMapper;
    private final ProfessorBatchQuotaRepository professorBatchQuotaRepository;
    private  final DeptCoordinatorRepository coordinatorRepository;
    private final ProjectApplicationsRepository projectApplicationsRepository;

    public Professor createProfile(@Valid ProfCreateProfileRequest profileRequest, User user) {
        String baseDir = System.getProperty("user.dir") + File.separator+"uploads"+File.separator;
        String profilePhotoDir = baseDir + "profilePhoto"+File.separator;


        MultipartFile photo=profileRequest.getProfilePhoto();
        FileValidator.validateImage(photo,3 * 1024 * 1024);//2mb

        try{
            new File(profilePhotoDir).mkdirs();

            String profilePhotoName=user.getId()+"_"+photo.getOriginalFilename();
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
                    .experience(profileRequest.getExperience())
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

    public List<Professor> filterBySlots(Long projectId, User user) {

            Professor professor=professorRepository.findByUser(user).orElseThrow(()->new RuntimeException("only professors are allowed to user this filter"));
            DeptCoordinator coordinator= coordinatorRepository.findByDeptNameAndIsActive(professor.getDepartmentName(), true).orElseThrow(()-> new RuntimeException("no dept coordinator found for your department"));
            Project project=projectRepository.findByProjectId(projectId).orElseThrow(()-> new ResourceNotFoundException("Project with ProjectID  : "+projectId+" not found"));

            Long maxIntakeAllowed=coordinator.getMaxIntake();
            Double needed = maxIntakeAllowed.doubleValue() - (project.getSlots() / 2.0);
        System.out.println("Max intake allowed = " + maxIntakeAllowed);
        System.out.println("Project slots = " + project.getSlots());
        System.out.println("Allowed = " + needed);
        System.out.println("Project ID = " + project.getProjectId());
            return  professorBatchQuotaRepository
                    .findAllAvailableForProject(project,needed,coordinator.getBatch())
                    .stream()
                    .filter(prof -> !prof.getProfessorId().equals(professor.getProfessorId()))
                    .toList();
    }

    public ProfDashboardDto getDashboard(User user) {
//        if(!user.getRole().equals(Role.PROFF))
//            throw new RuntimeException("Please request Dashboard according to your  role");

        Professor professor= professorRepository.findByUser(user).orElseThrow(()-> new UserNotFoundException("professor not found with mail id : "+user.getEmail()));

        Map<ApplicationStatus, Long> stats= getApplicationsStats(professor);
        Long pending = stats.getOrDefault(ApplicationStatus.PENDING, 0L);
        Long approved = stats.getOrDefault(ApplicationStatus.CONFIRMED, 0L);
        Long rejected = stats.getOrDefault(ApplicationStatus.REJECTED, 0L);
        Long totalProjects= projectRepository.countByProfessor(professor);
        Long total = pending + approved + rejected;

       return ProfDashboardDto.builder()
               .name(professor.getName())
               .departmentName(professor.getDepartmentName())
               .email(professor.getEmail())
               .profilePhotoPath(professor.getProfilePhotoPath())
               .totalApplication(total)
               .approved(approved)
               .pending(pending)
               .rejected(rejected)
               .totalProjects(totalProjects)
               .build();
    }

    private Map<ApplicationStatus, Long> getApplicationsStats(Professor professor) {
        List<Object[]> results=projectApplicationsRepository.countByProfessor(professor);
        Map<ApplicationStatus, Long>  stats=new HashMap<>();

        for (Object[] row : results) {
            ApplicationStatus status = (ApplicationStatus) row[0];
            Long count = (Long) row[1];
            stats.put(status, count);
        }

        return stats;
    }

    public Double getSlotsLeft(User user) {
        Professor professor= professorRepository.findByUser(user).orElseThrow(() ->new UserNotFoundException("no prof found with email : "+user.getEmail()));
        DeptCoordinator coordinator= coordinatorRepository.findByDeptNameAndIsActive(professor.getDepartmentName(), true).orElseThrow(()-> new UserNotFoundException("no Dept Coordinator found for prof department"));

        ProfessorBatchQuota pbq=professorBatchQuotaRepository.findByProfessorAndBatch(professor,coordinator.getBatch()).orElseThrow(()-> new ResourceNotFoundException("no Quato found for the professor found in the current batch"));
        return pbq.getMaxStudents()-pbq.getAllocatedStudents();
    }
}