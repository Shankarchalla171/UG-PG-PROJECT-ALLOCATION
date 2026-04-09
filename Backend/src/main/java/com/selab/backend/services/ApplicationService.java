package com.selab.backend.services;

import com.selab.backend.Dto.*;
import com.selab.backend.exceptions.ResourceNotFoundException;
import com.selab.backend.mappers.ProjectMapper;
import com.selab.backend.mappers.StudentMapper;
import com.selab.backend.models.*;
import com.selab.backend.repositories.DeptCoordinatorRepository;
import com.selab.backend.repositories.ProjectApplicationsRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

@Service
@RequiredArgsConstructor
@Transactional
public class ApplicationService {

    private final ProjectApplicationsRepository projectApplicationsRepository;
    private final StudentMapper studentMapper;
    private final DeptCoordinatorRepository deptCoordinatorRepository;
    private final ProjectMapper projectMapper;
//    private final StudentMapper studentMapper;

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
                dto.setAppliedOn(application.getAppliedOn());
            }

            long competitors =
                    projectApplicationsRepository.countByProject(application.getProject());

            dto.setCompetitors(Math.max(competitors,0));

            return dto;
        });
    }

    public Page<ProfessorApplicationDto> getProfessorApplications(Professor professor,
                                                                  String status,
                                                                  Long projectId,
                                                                  Pageable pageable) {

        Page<ProjectApplications> applications;

        boolean hasStatus = status != null && !status.isEmpty() && !status.equalsIgnoreCase("all");
        boolean hasProject = projectId != null;

        if (hasProject && hasStatus) {
            ApplicationStatus enumStatus = ApplicationStatus.valueOf(status.toUpperCase());
            applications = projectApplicationsRepository
                    .findByProject_ProjectIdAndProject_ProfessorAndStatus(
                            projectId, professor, enumStatus, pageable);

        } else if (hasProject) {
            applications = projectApplicationsRepository
                    .findByProject_ProjectIdAndProject_Professor(
                            projectId, professor, pageable);

        } else if (hasStatus) {
            ApplicationStatus enumStatus = ApplicationStatus.valueOf(status.toUpperCase());
            applications = projectApplicationsRepository
                    .findByProject_ProfessorAndStatus(
                            professor, enumStatus, pageable);

        } else {
            applications = projectApplicationsRepository
                    .findByProject_Professor(professor, pageable);
        }

        return applications.map(application -> {

            ProfessorApplicationDto dto = new ProfessorApplicationDto();

            dto.setApplicationId(application.getAppliedProjectsId());
            dto.setProjectTitle(application.getProject().getTitle());
            dto.setMessage(application.getMessage());
            dto.setStatus(application.getStatus().toString());

            if(application.getAppliedOn()!=null){
                dto.setAppliedOn(application.getAppliedOn().toLocalDate());
            }

            dto.setTeamId(application.getTeam().getTeamId());
            dto.setTeamName(application.getTeam().getTeamName());
            dto.setTeamSize(application.getTeam().getTeamMembers().size());

            dto.setProfessorReview(application.getProfessorReview());

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

        Project project = application.getProject();
        Team team = application.getTeam();

        int teamSize = team.getTeamMembers().size();
        int remainingSlots = project.getSlots();

        if (teamSize > remainingSlots) {
            throw new RuntimeException("Not enough slots remaining for this team");
        }

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

    public List<ApplicationDto> getFinal(User user) {
         DeptCoordinator coordinator = deptCoordinatorRepository.findByUser(user).orElseThrow(()-> new ResourceNotFoundException("user not found.."));

        List<ProjectApplications> projectApplications= projectApplicationsRepository.getAllFinal(coordinator, ApplicationStatus.TEAM_CONFIRMED);
        List<ApplicationDto> applicationDtos=new ArrayList<>();
        for(ProjectApplications app:projectApplications){
            Team team=app.getTeam();
            List<StudentDto> memberDtos= team.getTeamMembers().stream()
                    .map(studentMapper::toDto).toList();
            TeamDto teamDto= TeamDto.builder()
                            .teamId(team.getTeamId())
                                    .isFinalized(team.getIsFinalized())
                                            .members(memberDtos)
                    .build();

            ApplicationDto appDto=ApplicationDto.builder()
                    .project(projectMapper.toResponseDto(app.getProject()))
                    .team(teamDto)
                    .build();

            applicationDtos.add(appDto);
        }

        return applicationDtos;
    }
}