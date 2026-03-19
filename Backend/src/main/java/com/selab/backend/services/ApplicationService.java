package com.selab.backend.services;

import com.selab.backend.Dto.ProfessorApplicationDto;
import com.selab.backend.Dto.StudentApplicationDto;
import com.selab.backend.models.*;
import com.selab.backend.repositories.ProjectApplicationsRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

@Service
@RequiredArgsConstructor
@Transactional
public class ApplicationService {

    private final ProjectApplicationsRepository projectApplicationsRepository;

    public void applyToProject(Project project, Team team, String message) {

        Optional<ProjectApplications> existing =
                projectApplicationsRepository.findByTeamAndProject(team, project);

        if (existing.isPresent()) {
            throw new RuntimeException("Team already applied to this project");
        }

        if(team.getTeamMembers().size() > project.getSlots()){
            throw new RuntimeException("Team size exceeds available project slots");
        }

        ProjectApplications application = new ProjectApplications();

        application.setProject(project);
        application.setTeam(team);
        application.setStatus(ApplicationStatus.PENDING);
        application.setMessage(message);
        application.setAppliedOn(LocalDateTime.now());

        projectApplicationsRepository.save(application);
    }

    public Page<StudentApplicationDto> getApplications(Student student, Pageable pageable) {

        Page<ProjectApplications> applications =
                projectApplicationsRepository.findByTeam(student.getTeam(), pageable);

        return applications.map(application -> {

            StudentApplicationDto dto = new StudentApplicationDto();
            dto.setApplicationId(application.getAppliedProjectsId());
            dto.setProjectTitle(application.getProject().getTitle());
            dto.setFacultyName(application.getProject().getProfessor().getName());
            dto.setSlots(application.getProject().getSlots());
            dto.setStatus(application.getStatus().toString());
            dto.setMessage(application.getMessage());

            if(application.getAppliedOn()!=null){
                dto.setAppliedOn(application.getAppliedOn().toLocalDate());
            }

            long competitors =
                    projectApplicationsRepository.countByProject(application.getProject())-1;

            dto.setCompetitors(Math.max(competitors,0));

            return dto;
        });
    }

    public Page<ProfessorApplicationDto> getProfessorApplications(Professor professor, Pageable pageable) {

        Page<ProjectApplications> applications =
                projectApplicationsRepository.findByProject_Professor(professor, pageable);

        return applications.map(application -> {

            ProfessorApplicationDto dto = new ProfessorApplicationDto();

            dto.setApplicationId(application.getAppliedProjectsId());
            dto.setProjectTitle(application.getProject().getTitle());
            dto.setTeamId(application.getTeam().getTeamId());
            dto.setMessage(application.getMessage());
            dto.setStatus(application.getStatus().toString());

            if(application.getAppliedOn()!=null){
                dto.setAppliedOn(application.getAppliedOn().toLocalDate());
            }

            return dto;
        });
    }

    public void addProfessorReview(Long applicationId, String review){

        ProjectApplications application =
                projectApplicationsRepository.findById(applicationId)
                        .orElseThrow(() -> new RuntimeException("Application not found"));

        application.setProfessorReview(review);

        projectApplicationsRepository.save(application);
    }

    public void acceptApplication(Long applicationId){

        ProjectApplications application =
                projectApplicationsRepository.findById(applicationId)
                        .orElseThrow(() -> new RuntimeException("Application not found"));

        application.setStatus(ApplicationStatus.CONFIRMED);

        projectApplicationsRepository.save(application);
    }

    public void rejectApplication(Long applicationId){

        ProjectApplications application =
                projectApplicationsRepository.findById(applicationId)
                        .orElseThrow(() -> new RuntimeException("Application not found"));

        application.setStatus(ApplicationStatus.REJECTED);

        projectApplicationsRepository.save(application);
    }
}