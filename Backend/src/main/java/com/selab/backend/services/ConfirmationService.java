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
    private final ProfessorBatchQuotaRepository professorBatchQuotaRepository;

    // ============ HELPER METHODS ============


    // =====================================================
// NEW FEATURE: Reject same project applications when project becomes full
// =====================================================
    private void rejectOtherTeamsApplicationsForProject(
            Long projectId,
            UUID confirmedTeamId
    ) {
        List<ProjectApplications> applications = applicationRepository.findAll().stream()
                .filter(app ->
                        app.getProject().getProjectId().equals(projectId) &&
                                !app.getTeam().getTeamId().equals(confirmedTeamId) &&
                                (
                                        app.getStatus() == ApplicationStatus.CONFIRMED ||
                                        app.getStatus() == ApplicationStatus.PENDING
                                )
                )
                .collect(Collectors.toList());

        applications.forEach(app ->
                app.setStatus(ApplicationStatus.PROJECT_FULL_REJECTED));

        if (!applications.isEmpty()) {
            applicationRepository.saveAll(applications);
        }
    }

    // =====================================================
// NEW FEATURE: Reject all pending applications under main professor
// =====================================================
    private void rejectAllPendingApplicationsForProfessor(
            Professor professor,
            ApplicationStatus rejectionStatus
    ) {
        List<ProjectApplications> applications = applicationRepository.findAll().stream()
                .filter(app ->
                        app.getProject().getProfessor().getProfessorId()
                                .equals(professor.getProfessorId()) &&
                                (
                                        app.getStatus() == ApplicationStatus.CONFIRMED ||
                                        app.getStatus() == ApplicationStatus.PENDING
                                )
                )
                .collect(Collectors.toList());

        applications.forEach(app ->
                app.setStatus(rejectionStatus));

        if (!applications.isEmpty()) {
            applicationRepository.saveAll(applications);
        }
    }


    // =====================================================
// NEW FEATURE: Full co-guide exhaustion handling
// Covers BOTH:
// 1. Projects where exhausted professor is main guide
//    -> FACULTY_FULL_REJECTED
// 2. Projects where exhausted professor is co-guide
//    -> CO_GUIDE_FULL_REJECTED
//
// Reject only applications still active:
// CONFIRMED or PENDING
// =====================================================
    private void rejectAllApplicationsForExhaustedCoGuide(
            Professor exhaustedProfessor
    ) {

        List<ProjectApplications> applications = applicationRepository.findAll().stream()
                .filter(app ->
                        (
                                app.getStatus() == ApplicationStatus.CONFIRMED ||
                                        app.getStatus() == ApplicationStatus.PENDING
                        )
                )
                .collect(Collectors.toList());

        List<ProjectApplications> changedApps = new ArrayList<>();

        for (ProjectApplications app : applications) {

            Project project = app.getProject();

            /*
             * Case 1:
             * Exhausted professor is MAIN professor
             */
            if (
                    project.getProfessor().getProfessorId()
                            .equals(exhaustedProfessor.getProfessorId())
            ) {
                app.setStatus(ApplicationStatus.FACULTY_FULL_REJECTED);
                changedApps.add(app);
            }

            /*
             * Case 2:
             * Exhausted professor is CO-GUIDE
             */
            else if (
                    project.getCoGuide() != null &&
                            project.getCoGuide().getProfessorId()
                                    .equals(exhaustedProfessor.getProfessorId())
            ) {
                app.setStatus(ApplicationStatus.CO_GUIDE_FULL_REJECTED);
                changedApps.add(app);
            }
        }

        if (!changedApps.isEmpty()) {
            applicationRepository.saveAll(changedApps);
        }
    }

    // =====================================================
// NEW FEATURE: Check whether professor quota is exhausted
// =====================================================
    private boolean isProfessorQuotaFull(
            Professor professor,
            String batch
    ) {
        ProfessorBatchQuota quota =
                professorBatchQuotaRepository
                        .findByProfessorAndBatch(professor, batch)
                        .orElseThrow(() -> new RuntimeException(
                                "Quota not found for Professor "
                                        + professor.getName()
                        ));

        double remaining =
                quota.getMaxStudents() - quota.getAllocatedStudents();

        // epsilon handling as remaining==0 fails incorrectly for floating/double values sometimes
        return Math.abs(remaining) < 0.0001;
    }

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
        Integer totalSlots = project.getSlots();
        Integer allocatedSlots = project.getAllocatedSlots();

        if (totalSlots == null) return 0;
        if (allocatedSlots == null) allocatedSlots = 0;

        return totalSlots - allocatedSlots;
    }

    private void reduceFacultyBatchQuota(Project project, Team team, int teamSize) {

        String batch = extractBatchFromTeam(team);

        Professor mainGuide = project.getProfessor();
        Professor coGuide = project.getCoGuide();

        if (coGuide == null) {

            validateQuota(mainGuide, batch, (double) teamSize);
            deductQuota(mainGuide, batch, (double) teamSize);

        } else {

            double splitLoad = teamSize / 2.0;

            /*
             * Validate both first
             */
            validateQuota(mainGuide, batch, splitLoad);
            validateQuota(coGuide, batch, splitLoad);

            /*
             * Deduct only after both validations pass
             */
            deductQuota(mainGuide, batch, splitLoad);
            deductQuota(coGuide, batch, splitLoad);
        }
    }

    private void validateQuota(
            Professor professor,
            String batch,
            double amount
    ) {
        ProfessorBatchQuota quota =
                professorBatchQuotaRepository
                        .findByProfessorAndBatch(professor, batch)
                        .orElseThrow(() -> new RuntimeException(
                                "No faculty quota set for Professor "
                                        + professor.getName()
                                        + " batch " + batch
                        ));

        double remaining =
                quota.getMaxStudents() - quota.getAllocatedStudents();

        if (remaining < amount) {
            throw new RuntimeException(
                    "Faculty quota exceeded for Professor "
                            + professor.getName()
            );
        }
    }

    private String extractBatchFromTeam(Team team) {

        /*
         * Validate team members exist
         */
        if (team.getTeamMembers() == null || team.getTeamMembers().isEmpty()) {
            throw new RuntimeException("Team has no members");
        }

        /*
         * Take first student
         * Assume all students belong to same batch
         */
        Student firstStudent = team.getTeamMembers().getFirst();

        String rollNumber = firstStudent.getRollNumber();

        /*
         * Validate roll number format
         */
        if (rollNumber == null || rollNumber.length() < 3) {
            throw new RuntimeException("Invalid roll number format");
        }

        /*
         * Extract first 3 characters
         * Example: B230668CS -> B23
         */
        return rollNumber.substring(0, 3);
    }

    private void deductQuota(
            Professor professor,
            String batch,
            double amount
    ) {

        ProfessorBatchQuota quota =
                professorBatchQuotaRepository
                        .findByProfessorAndBatch(professor, batch)
                        .orElseThrow(() -> new RuntimeException(
                                "No faculty quota set for Professor "
                                        + professor.getName()
                                        + " batch " + batch
                        ));

        Double before = quota.getAllocatedStudents();
        Double after = before + amount;

        System.out.println("Professor: " + professor.getName());
        System.out.println("Before: " + before);
        System.out.println("Amount: " + amount);
        System.out.println("After: " + after);

        quota.setAllocatedStudents(after);

        professorBatchQuotaRepository.save(quota);
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

        /*
         * 8.5 Verify and reduce faculty batch quota
         */
        reduceFacultyBatchQuota(project, team, teamSize);

        // 9. Update the accepted application to TEAM_CONFIRMED
        // =====================================================
// EXISTING: Mark selected application as TEAM_CONFIRMED
// =====================================================
        application.setStatus(ApplicationStatus.TEAM_CONFIRMED);
        applicationRepository.save(application);

        project.setAllocatedSlots(
                project.getAllocatedSlots() + teamSize
        );
        projectRepository.save(project);

// =====================================================
// NEW FEATURE: Project full exhaustion handling
// =====================================================
        int remainingAfterConfirmation = getRemainingProjectSlots(project);

        if (remainingAfterConfirmation == 0) {
            rejectOtherTeamsApplicationsForProject(
                    project.getProjectId(),
                    teamId
            );
        }

// =====================================================
// NEW FEATURE: Faculty exhaustion handling
// =====================================================
        String batch = extractBatchFromTeam(team);

        Professor mainGuide = project.getProfessor();
        Professor coGuide = project.getCoGuide();

        /*
         * Main guide full
         */
        if (isProfessorQuotaFull(mainGuide, batch)) {
            rejectAllPendingApplicationsForProfessor(
                    mainGuide,
                    ApplicationStatus.FACULTY_FULL_REJECTED
            );
        }

        /*
         * Co-guide full
         */
        if (coGuide != null &&
                isProfessorQuotaFull(coGuide, batch)) {
            rejectAllApplicationsForExhaustedCoGuide(coGuide);
        }

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