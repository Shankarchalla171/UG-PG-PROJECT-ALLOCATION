package com.selab.backend.services;

import com.selab.backend.Dto.DeptCoordinatorDashboardStatsDto;
import com.selab.backend.Dto.LimitsDto;
import com.selab.backend.exceptions.UserNotFoundException;
import com.selab.backend.models.*;
import com.selab.backend.repositories.*;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import com.selab.backend.Dto.DeptCoordinatorDashboardStatsDto;


import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
public class DeptCoordinatorService {
    private final ProfessorRepository professorRepository;
    private final DeptCoordinatorRepository deptCoordinatorRepository;
    private final ProfessorBatchQuotaRepository professorBatchQuotaRepository;
    private final StudentRepository studentRepository;
    private final ProjectRepository projectRepository;
    private final ProjectApplicationsRepository projectApplicationsRepository;


    public void setFacultyLimit(User user, Long limit) {

        /*
         * STEP 1:
         * Only dept coordinator allowed
         */
        if (!user.getRole().equals(Role.DEPTCORDINATOR)) {
            throw new RuntimeException(
                    "Only dept coordinator can set faculty student intake limit"
            );
        }

        /*
         * STEP 2:
         * Find logged-in coordinator
         */
        DeptCoordinator coordinator = deptCoordinatorRepository.findByUser(user)
                .orElseThrow(() -> new UserNotFoundException(
                        "Cannot find coordinator with email: " + user.getEmail()
                ));

        /*
         * STEP 3:
         * Extract department + batch
         */
        String departmentName = coordinator.getDeptName();
        String batch = coordinator.getBatch();

        /*
         * STEP 4:
         * Get all professors in same department
         */
        List<Professor> professors =
                professorRepository.findByDepartmentName(departmentName);

        if (professors.isEmpty()) {
            throw new RuntimeException(
                    "No professors found in department: " + departmentName
            );
        }

        /*
         * STEP 5:
         * PRE-VALIDATION PHASE
         * Check all professors first before updating anyone
         */
        for (Professor professor : professors) {

            Optional<ProfessorBatchQuota> existingQuota =
                    professorBatchQuotaRepository.findByProfessorAndBatch(
                            professor,
                            batch
                    );

            if (existingQuota.isPresent()) {

                ProfessorBatchQuota quota = existingQuota.get();

                /*
                 * Reject if new limit < already allocated
                 */
                if (limit.intValue() < quota.getAllocatedStudents()) {
                    throw new RuntimeException(
                            "Cannot reduce limit for Professor "
                                    + professor.getName()
                                    + " below already allocated students ("
                                    + quota.getAllocatedStudents()
                                    + ")"
                    );
                }
            }
        }

        /*
         * STEP 6:
         * SAFE UPDATE PHASE
         * Since validation passed, now update all
         */

        for (Professor professor : professors) {

            Optional<ProfessorBatchQuota> existingQuota =
                    professorBatchQuotaRepository.findByProfessorAndBatch(
                            professor,
                            batch
                    );

            if (existingQuota.isPresent()) {

                /*
                 * Update existing quota
                 */
                ProfessorBatchQuota quota = existingQuota.get();
                quota.setMaxStudents(limit);

                professorBatchQuotaRepository.save(quota);

            } else {

                /*
                 * Create new quota
                 */
                ProfessorBatchQuota newQuota = ProfessorBatchQuota.builder()
                        .professor(professor)
                        .batch(batch)
                        .maxStudents(limit)
                        .allocatedStudents(0.0)
                        .build();

                professorBatchQuotaRepository.save(newQuota);
            }
        }

        /*
         * STEP 7:
         * Update coordinator's own max intake
         */
        coordinator.setMaxIntake(limit);
        deptCoordinatorRepository.save(coordinator);
    }

    public void setStudentTeamLimit(User user, Long limit) {
        if(!user.getRole().equals(Role.DEPTCORDINATOR))
            throw new RuntimeException("only deptCoordinator can set the faculty student intake limit");
        DeptCoordinator coordinator=deptCoordinatorRepository.findByUser(user).orElseThrow(()-> new UserNotFoundException("cant find coordinator with the email : "+ user.getEmail()));
        coordinator.setMaxTeamSize(limit);
    }

    public LimitsDto getLimits(User user) {
        DeptCoordinator coordinator=deptCoordinatorRepository.findByUser(user).orElseThrow(()-> new UserNotFoundException("cant find coordinator with the email : "+ user.getEmail()));

        return LimitsDto.builder()
                .facultyIntakeLimit(coordinator.getMaxIntake())
                .StudentTeamSizeLimit(coordinator.getMaxTeamSize())
        .build();
    }




    @Transactional
    public DeptCoordinatorDashboardStatsDto getDashboardStats(User user) {

        DeptCoordinator coordinator = deptCoordinatorRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Department Coordinator not found"));

        String batch = coordinator.getBatch();
        String department = coordinator.getDepartmentName();

        // 1. Total Students in this department for this batch
        Long totalStudents = studentRepository.countByDepartmentAndBatch(department, batch);
        if (totalStudents == null) totalStudents = 0L;

        // 2. Allocated Students using native query
        Long allocatedStudents = projectApplicationsRepository
                .countAllocatedStudentsByDepartmentAndBatchNative(department, batch);
        if (allocatedStudents == null) allocatedStudents = 0L;

        // 3. Available Projects in this department
        Long availableProjects = projectRepository.countAvailableProjectsByDepartment(department);
        if (availableProjects == null) availableProjects = 0L;

        // 4. Pending Allocations using native query
        Long pendingAllocations = projectApplicationsRepository
                .countPendingAllocationsByDepartmentAndBatchNative(department, batch);
        if (pendingAllocations == null) pendingAllocations = 0L;

        return DeptCoordinatorDashboardStatsDto.builder()
                .totalStudents(totalStudents)
                .allocatedStudents(allocatedStudents)
                .availableProjects(availableProjects)
                .pendingAllocations(pendingAllocations)
                .batch(batch)
                .departmentName(department)
                .build();
    }

    /**
     * Get dashboard statistics for department coordinator (all batches)
     * Using native queries for reliability
     */
    @Transactional
    public DeptCoordinatorDashboardStatsDto getAllBatchesStats(User user) {

        DeptCoordinator coordinator = deptCoordinatorRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Department Coordinator not found"));

        String department = coordinator.getDepartmentName();

        // 1. Total Students in this department (all batches)
        Long totalStudents = studentRepository.countByDepartment(department);
        if (totalStudents == null) totalStudents = 0L;

        // 2. Allocated Students using native query
        Long allocatedStudents = projectApplicationsRepository
                .countAllocatedStudentsByDepartmentNative(department);
        if (allocatedStudents == null) allocatedStudents = 0L;

        // 3. Available Projects in this department
        Long availableProjects = projectRepository.countAvailableProjectsByDepartment(department);
        if (availableProjects == null) availableProjects = 0L;

        // 4. Pending Allocations using native query
        Long pendingAllocations = projectApplicationsRepository
                .countPendingAllocationsByDepartmentNative(department);
        if (pendingAllocations == null) pendingAllocations = 0L;

        return DeptCoordinatorDashboardStatsDto.builder()
                .totalStudents(totalStudents)
                .allocatedStudents(allocatedStudents)
                .availableProjects(availableProjects)
                .pendingAllocations(pendingAllocations)
                .departmentName(department)
                .build();
    }
}
