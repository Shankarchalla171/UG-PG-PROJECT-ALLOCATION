package com.selab.backend.services;

import com.selab.backend.Dto.*;
import com.selab.backend.exceptions.ResourceNotFoundException;
import com.selab.backend.mappers.ProjectMapper;
import com.selab.backend.mappers.StudentMapper;
import com.selab.backend.models.*;
import com.selab.backend.repositories.*;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

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
    private final DeadLineRepository deadLineRepository;
    private final ProjectRepository projectRepository;
    private final ProfessorBatchQuotaRepository professorBatchQuotaRepository;

    public void applyToProject(Student student,Project project, Team team, String message) {

        String batch=student.getRollNumber().substring(0,3);
        DeptCoordinator coordinator=deptCoordinatorRepository.findByBatch(batch).orElseThrow(() -> new RuntimeException("Project Allocation not active"));
        Event event=deadLineRepository.findByDeptCoordinatorAndTitle(coordinator, Phase.PROJECT_ALLOCATION).orElseThrow(()-> new ResourceNotFoundException("Project Allocation is not active"));

        LocalDate startDate = event.getStartDate();
        LocalDate endDate = event.getEndDate();
        LocalDate today = LocalDate.now();

        if( !((startDate == null || !today.isBefore(startDate)) && !today.isAfter(endDate))) {
            throw new RuntimeException("Project Allocation is not active");
        }

        boolean alreadyConfirmed = projectApplicationsRepository.existsByTeamAndStatus(team, ApplicationStatus.TEAM_CONFIRMED);

        if (alreadyConfirmed) {
            throw new RuntimeException("Team has already confirmed a project");
        }

        Optional<ProjectApplications> existing =
                projectApplicationsRepository.findByTeamAndProject(team, project);

        if (existing.isPresent()) {
            throw new RuntimeException("Team already applied to this project");
        }

        if (!student.getTeamRole().equals(TeamRole.TEAMlEAD)) {
            throw new RuntimeException("Only team leader can apply");
        }

        int availableSlots = project.getSlots() - project.getAllocatedSlots();

        if (team.getTeamMembers().size() > availableSlots) {
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

        List<Long> projectIds = applications.stream()
                .map(app -> app.getProject().getProjectId())
                .distinct()
                .toList();

        Map<Long, Long> projectCountMap = new HashMap<>();

        if (!projectIds.isEmpty()) {
            List<Object[]> results =
                    projectApplicationsRepository.countApplicationsByProjectIds(projectIds);

            for (Object[] row : results) {
                Long projectId = (Long) row[0];
                Number count = (Number) row[1]; // safer than direct cast
                projectCountMap.put(projectId, count.longValue());
            }
        }

        return applications.map(application -> {

            StudentApplicationDto dto = new StudentApplicationDto();

            dto.setApplicationId(application.getAppliedProjectsId());
            dto.setProjectTitle(application.getProject().getTitle());
            dto.setFacultyName(application.getProject().getProfessor().getName());

            Project project = application.getProject();
            int availableSlots = project.getSlots() - project.getAllocatedSlots();
            dto.setSlots(Math.max(availableSlots, 0));

            dto.setStatus(application.getStatus().toString());
            dto.setMessage(application.getMessage());

            if (application.getAppliedOn() != null) {
                dto.setAppliedOn(application.getAppliedOn());
            }

            long competitors = projectCountMap.getOrDefault(
                    project.getProjectId(),
                    0L
            );

            dto.setCompetitors(competitors);

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

        Project project = projectRepository.findByIdForUpdate(
                application.getProject().getProjectId()
        ).orElseThrow(() -> new RuntimeException("Project not found"));

        boolean alreadyConfirmed =
                projectApplicationsRepository.existsByTeamAndStatus(
                        application.getTeam(),
                        ApplicationStatus.TEAM_CONFIRMED
                );

        if (alreadyConfirmed) {
            throw new RuntimeException("Team already confirmed another project");
        }

        if (application.getStatus() == ApplicationStatus.CONFIRMED) {
            throw new RuntimeException("Application already accepted");
        }

        Team team = application.getTeam();

        int teamSize = team.getTeamMembers().size();
        String roll = team.getTeamMembers().getFirst().getRollNumber();
        String batch = roll.substring(0, 3).toUpperCase();
        Professor professor = project.getProfessor();

        ProfessorBatchQuota quota = professorBatchQuotaRepository
                                    .findByProfessorAndBatch(professor, batch)
                                    .orElseThrow(() -> new RuntimeException(
                                            "Quota not found for Professor "
                                                    + professor.getName()
                                    ));

        double allocatedStudents = quota.getAllocatedStudents();
        double maxStudents = quota.getMaxStudents();

        boolean hasCoGuide = project.getCoGuide() != null;

        if (!hasCoGuide) {
            if (teamSize + allocatedStudents > maxStudents) {
                throw new RuntimeException("Not enough slots for this batch");
            }
        } else {
            if (teamSize + (allocatedStudents / 2.0) > maxStudents) {
                throw new RuntimeException("Not enough slots for this batch");
            }
        }

        int availableSlots = project.getSlots() - project.getAllocatedSlots();

        if (teamSize > availableSlots) {
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

        DeptCoordinator deptCoordinator = deptCoordinatorRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Coordinator not found"));

        String coordinatorBatch = deptCoordinator.getBatch();

        List<ProjectApplications> projectApplications =
                projectApplicationsRepository.findByStatus(ApplicationStatus.TEAM_CONFIRMED);

        List<ApplicationDto> applicationDto = new ArrayList<>();

        for (ProjectApplications app : projectApplications) {

            Team team = app.getTeam();

            // 👉 Extract batch from first member
            String teamBatch = team.getTeamMembers().getFirst()
                    .getRollNumber()
                    .substring(0, 3);

            if (!teamBatch.equalsIgnoreCase(coordinatorBatch)) {
                continue;
            }

            List<StudentDto> memberDto = team.getTeamMembers().stream()
                    .map(studentMapper::toDto)
                    .toList();

            TeamDto teamDto = TeamDto.builder()
                    .teamId(team.getTeamId())
                    .isFinalized(team.getIsFinalized())
                    .members(memberDto)
                    .build();

            ApplicationDto appDto = ApplicationDto.builder()
                    .project(projectMapper.toResponseDto(app.getProject()))
                    .team(teamDto)
                    .build();

            applicationDto.add(appDto);
        }

        return applicationDto;
    }
}