package com.selab.backend.services;

import com.selab.backend.Dto.ProfessorFinalAllocationDto;
import com.selab.backend.Dto.StudentDto;
import com.selab.backend.Dto.TeamDto;
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
import java.util.ArrayList;

@Service
@RequiredArgsConstructor
public class ConfirmationService {

    private final ProjectApplicationsRepository applicationRepository;
    private final StudentRepository studentRepository;
    private final ProjectRepository projectRepository;
    private final TeamRepository teamRepository;
    private final ProfessorRepository professorRepository;

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
                student.getTeamRole().name().equals("TEAMlEAD");
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
     * Get the TEAM_CONFIRMED application for a team (if any)
     */
    private ProjectApplications getTeamConfirmedApplicationForTeam(UUID teamId) {
        return applicationRepository.findAll().stream()
                .filter(app -> app.getTeam() != null &&
                        app.getTeam().getTeamId().equals(teamId) &&
                        app.getStatus() == ApplicationStatus.TEAM_CONFIRMED)
                .findFirst()
                .orElse(null);
    }

    /**
     * Check if team already has a TEAM_CONFIRMED application
     */
    private boolean hasTeamConfirmedProject(UUID teamId) {
        return getTeamConfirmedApplicationForTeam(teamId) != null;
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
     * Get all applications for the current user's team to show on confirmations page
     * This includes:
     * - All CONFIRMED applications (professor accepted, waiting for team)
     * - The TEAM_CONFIRMED application (if any) - this is the allocated project
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

        // 5. Create a list to hold all applications to display
        List<ViewConfirmationsDto> result = new ArrayList<>();

        // 6. Check if there's a TEAM_CONFIRMED application (allocated project)
        ProjectApplications teamConfirmedApp = getTeamConfirmedApplicationForTeam(teamId);
        if (teamConfirmedApp != null) {
            // Add the allocated project to the result with special flag
            result.add(convertToDto(teamConfirmedApp, teamSize, isTeamLead, true));
        }

        // 7. Get all CONFIRMED applications (professor accepted, waiting for team)
        // Only add these if there's no allocated project yet
        if (teamConfirmedApp == null) {
            List<ProjectApplications> confirmedApplications = getConfirmedApplicationsForTeam(teamId);
            List<ViewConfirmationsDto> confirmedDtos = confirmedApplications.stream()
                    .map(application -> convertToDto(application, teamSize, isTeamLead, false))
                    .collect(Collectors.toList());
            result.addAll(confirmedDtos);
        }

        // 8. Return the combined list
        return result;
    }

    /**
     * Convert application to ViewConfirmationsDto
     * Added a new parameter 'isAllocated' to indicate if this is the finalized project
     */
    private ViewConfirmationsDto convertToDto(ProjectApplications application, Integer teamSize,
                                              boolean isTeamLead, boolean isAllocated) {

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

        // Set a flag to indicate if this is the allocated project
        dto.setAllocated(isAllocated);

        // Determine if team can confirm this application
        // Allocated projects cannot be confirmed again
        boolean enoughSlots = remainingSlots >= teamSize;
        boolean canConfirm = !isAllocated && isTeamLead && enoughSlots &&
                application.getStatus() == ApplicationStatus.CONFIRMED;

        dto.setCanConfirm(canConfirm);

        // Set appropriate message
        if (isAllocated) {
            dto.setMessage("Project Allocated! Your team has been assigned to this project.");
        } else if (!isTeamLead) {
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
     * Now returns the finalized application DTO
     */
    @Transactional
    public ViewConfirmationsDto confirmApplication(Long applicationId, User currentUser) {

        // 1. Get the application
        ProjectApplications application = applicationRepository.findByAppliedProjectsId(applicationId)
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

        // 11. Return the finalized application as DTO with allocated=true
        return convertToDto(application, teamSize, isTeamLead(student), true);
    }

    /**
     * Team lead rejects an application
     * POST /api/confirmations/{applicationId}/reject
     */
    @Transactional
    public void rejectApplication(Long applicationId, User currentUser) {

        // 1. Get the application
        ProjectApplications application = applicationRepository.findByAppliedProjectsId(applicationId)
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

    /**
     * Get all TEAM_CONFIRMED applications for a professor's projects
     * Used for the "Final Team Allocations" page
     *
     * @param currentUser The logged-in professor user
     * @return List of ProfessorFinalAllocationDto with all confirmed allocations
     */
    public List<ProfessorFinalAllocationDto> getTeamConfirmedAllocationsForProfessor(User currentUser) {
        // 1. Verify user is a professor
        if (currentUser.getRole() != Role.PROFF) {
            throw new RuntimeException("Only professors can access team allocations");
        }

        // 2. Get professor from user
        Professor professor = professorRepository.findByUser(currentUser)
                .orElseThrow(() -> new ResourceNotFoundException("Professor profile not found for user: " + currentUser.getUsername()));

        Long professorId = professor.getProfessorId();

        // 3. Get all TEAM_CONFIRMED applications for this professor's projects
        List<ProjectApplications> applications = applicationRepository
                .findByProfessorIdAndStatus(professorId, ApplicationStatus.TEAM_CONFIRMED);

        // 4. Calculate statistics
        long totalTeams = applications.size();
        long totalStudents = applications.stream()
                .mapToLong(app -> getTeamSize(app.getTeam().getTeamId()))
                .sum();
        long activeProjects = applications.stream()
                .map(app -> app.getProject().getProjectId())
                .distinct()
                .count();

        // 5. Convert to DTOs
        return applications.stream()
                .map(app -> convertToProfessorFinalAllocationDto(app, totalTeams, totalStudents, activeProjects))
                .collect(Collectors.toList());
    }

    /**
     * Convert a ProjectApplications entity to ProfessorFinalAllocationDto
     */
    private ProfessorFinalAllocationDto convertToProfessorFinalAllocationDto(
            ProjectApplications application,
            long totalTeams,
            long totalStudents,
            long activeProjects) {

        Project project = application.getProject();
        Professor professor = project.getProfessor();
        Team team = application.getTeam();

        // Convert team members to StudentDto
        List<StudentDto> studentDtos = team.getTeamMembers().stream()
                .map(this::convertStudentToDto)
                .collect(Collectors.toList());

        // Create TeamDto using your existing builder pattern
        TeamDto teamDto = TeamDto.builder()
                .teamId(team.getTeamId())
                .members(studentDtos)
                .isFinalized(team.getIsFinalized() != null ? team.getIsFinalized() : false)
                .build();

        // Build and return the DTO
        return ProfessorFinalAllocationDto.builder()
                .applicationId(application.getAppliedProjectsId())
                .projectId(project.getProjectId())
                .projectTitle(project.getTitle())
                .projectDescription(project.getDescription())
                .duration(project.getDuration())
                .confirmedDate(application.getConfirmedDate())
                .professorName(professor.getName())
                .professorEmail(professor.getEmail())
                .team(teamDto)
                .totalTeams((int) totalTeams)
                .totalStudents((int) totalStudents)
                .activeProjects((int) activeProjects)
                .build();
    }

    /**
     * Convert Student entity to StudentDto
     */
    private StudentDto convertStudentToDto(Student student) {
        StudentDto dto = new StudentDto();
        dto.setStudentId(student.getStudentId());
        dto.setName(student.getName());
        dto.setCollegeEmailId(student.getCollegeEmailId());
        dto.setDepartmentName(student.getDepartmentName());
        dto.setRollNumber(student.getRollNumber());
        dto.setResumePath(student.getResumePath());
        dto.setProfilePhotoLink(student.getProfilePhotoLink());
        dto.setTeamRole(student.getTeamRole() != null ? student.getTeamRole().name() : null);
        return dto;
    }
}