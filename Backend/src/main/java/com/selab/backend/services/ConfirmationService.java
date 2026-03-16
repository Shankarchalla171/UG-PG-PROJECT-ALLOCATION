package com.selab.backend.services;

import com.selab.backend.Dto.ViewConfirmationsDto;
import com.selab.backend.exceptions.AccessDeniedException;
import com.selab.backend.exceptions.ResourceNotFoundException;
import com.selab.backend.models.*;
import com.selab.backend.repositories.*;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ConfirmationService {

    private final ProjectApplicationsRepository applicationRepository;
    private final StudentRepository studentRepository;
    private final ProjectRepository projectRepository;

    // ============ HELPER METHODS ============

    /**
     * Get student from current user
     */
    private Student getStudentFromUser(User currentUser) {
        return studentRepository.findByUser(currentUser)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found for current user"));
    }

    /**
     * Check if student is team lead (based on students.team_role)
     */
    private boolean isTeamLead(Student student) {
        return student.getTeamRole() != null &&
                student.getTeamRole().name().equals("TEAMLEAD");
    }

    /**
     * Get team size by counting students with same team_id
     */
    private Integer getTeamSize(UUID teamId) {
        List<Student> allStudents = studentRepository.findAll();
        return (int) allStudents.stream()
                .filter(s -> s.getTeam() != null &&
                        s.getTeam().getTeamId().equals(teamId))
                .count();
    }

    /**
     * Get all CONFIRMED applications for a team
     */
    private List<ProjectApplications> getConfirmedApplicationsForTeam(UUID teamId) {
        return applicationRepository.findAll().stream()
                .filter(app -> app.getTeam() != null &&
                        app.getTeam().getTeamId().equals(teamId) &&
                        app.getStatus() == ApplicationStatus.CONFIRMED)
                .collect(Collectors.toList());
    }

    /**
     * Check if team already has a TEAM_CONFIRMED application
     */
    private boolean hasTeamConfirmedProject(UUID teamId) {
        return applicationRepository.findAll().stream()
                .anyMatch(app -> app.getTeam() != null &&
                        app.getTeam().getTeamId().equals(teamId) &&
                        app.getStatus() == ApplicationStatus.TEAM_CONFIRMED);
    }

    /**
     * Get all other CONFIRMED applications for a team (excluding one)
     */
    private List<ProjectApplications> getOtherConfirmedApplications(UUID teamId, Long excludeApplicationId) {
        return applicationRepository.findAll().stream()
                .filter(app -> app.getTeam() != null &&
                        app.getTeam().getTeamId().equals(teamId) &&
                        app.getStatus() == ApplicationStatus.CONFIRMED &&
                        !app.getAppliedProjectsId().equals(excludeApplicationId))
                .collect(Collectors.toList());
    }

    /**
     * Calculate remaining slots for a project
     */
    private Integer getRemainingProjectSlots(Project project) {
        // Get total slots for this project (from projects.slots)
        Integer totalSlots = project.getSlots();
        if (totalSlots == null) return 0;

        // Get all TEAM_CONFIRMED applications for this project
        List<ProjectApplications> confirmedApps = applicationRepository.findAll().stream()
                .filter(app -> app.getProject().getProjectId().equals(project.getProjectId()) &&
                        app.getStatus() == ApplicationStatus.TEAM_CONFIRMED)
                .collect(Collectors.toList());

        // Calculate total students already assigned to this project
        int assignedStudents = 0;
        for (ProjectApplications app : confirmedApps) {
            assignedStudents += getTeamSize(app.getTeam().getTeamId());
        }

        return totalSlots - assignedStudents;
    }

    // ============ MAIN SERVICE METHODS ============

    /**
     * Get all CONFIRMED applications for the current user's team
     * GET /api/confirmations
     */
    public List<ViewConfirmationsDto> getConfirmationsForTeam(User currentUser) {

        // 1. Get student from current user
        Student student = getStudentFromUser(currentUser);

        // 2. Get team for this student
        Team team = student.getTeam();
        if (team == null) {
            throw new ResourceNotFoundException("Student is not part of any team");
        }
        UUID teamId = team.getTeamId();

        // 3. Get team size
        Integer teamSize = getTeamSize(teamId);

        // 4. Check if current user is team lead
        boolean isTeamLead = isTeamLead(student);

        // 5. Get all CONFIRMED applications for this team
        List<ProjectApplications> confirmedApplications = getConfirmedApplicationsForTeam(teamId);

        // 6. Convert to DTOs with canConfirm logic
        return confirmedApplications.stream()
                .map(application -> convertToDto(application, teamSize, isTeamLead))
                .collect(Collectors.toList());
    }

    /**
     * Convert application to ViewConfirmationsDto
     */
    private ViewConfirmationsDto convertToDto(ProjectApplications application, Integer teamSize, boolean isTeamLead) {

        Project project = application.getProject();
        Professor professor = project.getProfessor();

        // Calculate remaining slots for this project
        Integer remainingSlots = getRemainingProjectSlots(project);

        ViewConfirmationsDto dto = new ViewConfirmationsDto();
        dto.setApplicationId(application.getAppliedProjectsId());
        dto.setProjectTitle(project.getTitle());
        dto.setProjectDescription(project.getDescription());
        dto.setDuration(project.getDuration());
        dto.setFacultyName(professor.getName());
        dto.setProjectAvailableSlots(remainingSlots);

        // Determine if team can confirm this application
        boolean enoughSlots = remainingSlots >= teamSize;
        boolean canConfirm = isTeamLead && enoughSlots;

        dto.setCanConfirm(canConfirm);

        // Set appropriate message
        if (!isTeamLead) {
            dto.setMessage("Only team lead can confirm projects");
        } else if (!enoughSlots) {
            dto.setMessage("Not enough slots available for this project (Need " + teamSize + " slots, " + remainingSlots + " left)");
        } else {
            dto.setMessage("You can confirm this project");
        }

        return dto;
    }

    /**
     * Team lead confirms an application
     * POST /api/confirmations/{applicationId}/confirm
     */
    @Transactional
    public void confirmApplication(Long applicationId, User currentUser) {

        // 1. Get the application
        ProjectApplications application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found with id: " + applicationId));

        // 2. Verify status is CONFIRMED
        if (application.getStatus() != ApplicationStatus.CONFIRMED) {
            throw new IllegalStateException("This application is not in CONFIRMED state. Current status: " + application.getStatus());
        }

        // 3. Get student and team
        Student student = getStudentFromUser(currentUser);
        Team team = student.getTeam();
        if (team == null) {
            throw new ResourceNotFoundException("Student is not part of any team");
        }
        UUID teamId = team.getTeamId();

        // 4. Verify this application belongs to this team
        if (!application.getTeam().getTeamId().equals(teamId)) {
            throw new AccessDeniedException("This application does not belong to your team");
        }

        // 5. Verify current user is team lead
        if (!isTeamLead(student)) {
            throw new AccessDeniedException("Only team lead can confirm applications");
        }

        // 6. Check if team already has a confirmed project
        if (hasTeamConfirmedProject(teamId)) {
            throw new IllegalStateException("Your team has already confirmed a project");
        }

        // 7. Get project and check slots
        Project project = application.getProject();
        Integer teamSize = getTeamSize(teamId);
        Integer remainingSlots = getRemainingProjectSlots(project);

        // 8. Verify enough slots
        if (remainingSlots < teamSize) {
            throw new IllegalStateException(
                    String.format("Project only has %d slots remaining, but your team needs %d slots",
                            remainingSlots, teamSize)
            );
        }

        // 9. Update the accepted application to TEAM_CONFIRMED
        application.setStatus(ApplicationStatus.TEAM_CONFIRMED);
        applicationRepository.save(application);

        // 10. Auto-reject all other CONFIRMED applications for this team
        List<ProjectApplications> otherConfirmedApps = getOtherConfirmedApplications(teamId, applicationId);
        otherConfirmedApps.forEach(app -> app.setStatus(ApplicationStatus.TEAM_REJECTED));
        if (!otherConfirmedApps.isEmpty()) {
            applicationRepository.saveAll(otherConfirmedApps);
        }

        // Note: We don't update project.slots here because they're calculated on the fly
        // based on TEAM_CONFIRMED applications. The project.slots field remains as the total/maximum slots.
    }

    /**
     * Team lead rejects an application
     * POST /api/confirmations/{applicationId}/reject
     */
    @Transactional
    public void rejectApplication(Long applicationId, User currentUser) {

        // 1. Get the application
        ProjectApplications application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found with id: " + applicationId));

        // 2. Get student and team
        Student student = getStudentFromUser(currentUser);
        Team team = student.getTeam();
        if (team == null) {
            throw new ResourceNotFoundException("Student is not part of any team");
        }
        UUID teamId = team.getTeamId();

        // 3. Verify this application belongs to this team
        if (!application.getTeam().getTeamId().equals(teamId)) {
            throw new AccessDeniedException("This application does not belong to your team");
        }

        // 4. Verify current user is team lead
        if (!isTeamLead(student)) {
            throw new AccessDeniedException("Only team lead can reject applications");
        }

        // 5. Verify status is CONFIRMED
        if (application.getStatus() != ApplicationStatus.CONFIRMED) {
            throw new IllegalStateException("Can only reject applications that are in CONFIRMED state");
        }

        // 6. Update status to TEAM_REJECTED
        application.setStatus(ApplicationStatus.TEAM_REJECTED);
        applicationRepository.save(application);
    }
}