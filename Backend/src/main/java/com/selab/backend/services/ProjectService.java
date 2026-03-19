package com.selab.backend.services;

import com.selab.backend.Dto.ProjectListingDto;
import com.selab.backend.Dto.ProjectRequestDto;
import com.selab.backend.Dto.ProjectResponseDto;
import com.selab.backend.exceptions.ResourceNotFoundException;
import com.selab.backend.mappers.ProfessorMapper;
import com.selab.backend.mappers.ProjectMapper;
import com.selab.backend.models.*;
import com.selab.backend.repositories.DeptCoordinatorRepository;
import com.selab.backend.repositories.ProfessorRepository;
import com.selab.backend.repositories.ProjectRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import com.selab.backend.Dto.ProjectUpdateDto;

import com.selab.backend.exceptions.AccessDeniedException;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProjectService {
    private final ProjectRepository projectRepository;
    private final ProfessorRepository professorRepository;
    private final ProfessorMapper professorMapper;
    private final ProjectMapper projectMapper;
    private  final DeptCoordinatorRepository deptCoordinatorRepository;


    public List<ProjectListingDto> getProjectListings(Student student) {

        List<Project> projects =
                projectRepository.findProjectsNotAppliedByTeam(student.getTeam());

        return projects.stream().map(project -> {

            ProjectListingDto dto = new ProjectListingDto();

            dto.setId(project.getProjectId());
            dto.setProjectTitle(project.getTitle());
            dto.setDescription(project.getDescription());

            dto.setFacultyName(project.getProfessor().getName());

            dto.setDomains(
                    Arrays.asList((project.getDomain() != null ? project.getDomain() : "").split(","))
            );

            dto.setPreRequisites(
                    project.getPreRequisites()
            );

            dto.setAvailableSlots(
                    project.getSlots()
            );

            return dto;

        }).toList();
    }


    @Transactional
    public ProjectResponseDto createProject(ProjectRequestDto projectRequestDto, User user){
        Professor professor = professorRepository.findByUser(user)
                .orElseThrow(() -> new ResourceNotFoundException("Professor not found"));


        String deptName = professor.getDepartmentName();

        DeptCoordinator coordinator = deptCoordinatorRepository
                .findByDeptName(deptName)
                .orElseThrow(() -> new RuntimeException("Coordinator not found for department"));


        Project project = Project.builder()
                .title(projectRequestDto.getTitle())
                .description(projectRequestDto.getDescription())
                .slots(projectRequestDto.getSlots())
                .duration(projectRequestDto.getDuration())
                .preRequisites(projectRequestDto.getPrerequisites())
                .professor(professor)
                .domain(projectRequestDto.getDomain())
                .deptCoordinator(coordinator)
                .build();

        Project savedProject = projectRepository.save(project);
        return buildResponseDtoWithProfessor(savedProject, professor);
    }

    private ProjectResponseDto buildResponseDtoWithProfessor(Project project, Professor professor) {
        return ProjectResponseDto.builder()
                .projectId(project.getProjectId())
                .title(project.getTitle())
                .description(project.getDescription())
                .slots(project.getSlots())
                .duration(project.getDuration())
                .prerequisites(project.getPreRequisites())
                .domain(project.getDomain())
                .professor(professorMapper.toDto(professor))
                .build();
    }

    //  GET by ID
    public ProjectResponseDto getProjectById(Long id){
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + id));
        return mapToResponseDto(project);  // Uses the simpler version
    }

    //  GET all projects by professor ID
    public List<ProjectResponseDto> getProjectsByProfessorId(Long professorId) {
        // First verify professor exists
        if (!professorRepository.existsById(professorId)) {
            throw new ResourceNotFoundException("Professor not found with id: " + professorId);
        }

        List<Project> projects = projectRepository.findByProfessorProfessorId(professorId);
        return projects.stream()
                .map(this::mapToResponseDto)  // Uses the simpler version
                .collect(Collectors.toList());
    }

    //  GET all projects for current professor (from token)
    public List<ProjectResponseDto> getAllProjectsByProfessor(User user) {
        Professor professor = professorRepository.findByUser(user)
                .orElseThrow(() -> new ResourceNotFoundException("Professor profile not found for user"));

        return getProjectsByProfessorId(professor.getProfessorId());  // Reuse the method above
    }

    // GET all projects
    public List<ProjectResponseDto> getAllProjects() {
        return projectRepository.findAll().stream()
                .map(this::mapToResponseDto)
                .collect(Collectors.toList());
    }

    // GET projects having the keyword
    public List<ProjectResponseDto> searchProjects(String keyword) {
        return projectRepository.findByTitleContainingIgnoreCase(keyword)
                .stream()
                .map(this::mapToResponseDto)
                .collect(Collectors.toList());
    }

    private ProjectResponseDto mapToResponseDto(Project project) {
        return ProjectResponseDto.builder()
                .projectId(project.getProjectId())
                .title(project.getTitle())
                .description(project.getDescription())
                .slots(project.getSlots())
                .duration(project.getDuration())
                .prerequisites(project.getPreRequisites())
                .domain(project.getDomain())
                .professor(professorMapper.toDto(project.getProfessor()))  // Get from project
                .build();
    }



    /**
     * SINGLE UPDATE METHOD - Handles both full and partial updates
     * Uses MapStruct to update only provided fields
     */
    @Transactional
    public ProjectResponseDto updateProject(
            Long projectId,
            ProjectUpdateDto updateDto,
            User user) {

        // 1. Find the project
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + projectId));

        // 2. Authorization check - only project owner can update
        Professor professor = professorRepository.findByUser(user)
                .orElseThrow(() -> new ResourceNotFoundException("Professor not found"));

        if (!project.getProfessor().getProfessorId().equals(professor.getProfessorId())) {
            throw new AccessDeniedException("You can only update your own projects");
        }

        // 3. Use MapStruct to update only non-null fields
        // This is the key - it only updates fields that are present in the DTO
        projectMapper.updateProjectFromDto(updateDto, project);

        // 4. Save and return
        Project updatedProject = projectRepository.save(project);
        return projectMapper.toResponseDto(updatedProject);
    }

    /**
     * DELETE a project
     * Only the professor who owns the project can delete it
     */
    @Transactional
    public void deleteProject(Long projectId, User user) {

        // 1. Find the project
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + projectId));

        // 2. Authorization check - only project owner can delete
        Professor professor = professorRepository.findByUser(user)
                .orElseThrow(() -> new ResourceNotFoundException("Professor not found"));

        if (!project.getProfessor().getProfessorId().equals(professor.getProfessorId())) {
            throw new AccessDeniedException("You can only delete your own projects");
        }

//        // 3. Check if project has applications (optional - business rule)
//        if (project.getApplications() != null && !project.getApplications().isEmpty()) {
//            // Option 1: Prevent deletion if there are applications
//            throw new IllegalStateException("Cannot delete project with existing applications");
//
//            // Option 2: Delete applications first (cascade)
//            //applicationRepository.deleteAll(project.getApplications());
//        }

        // 4. Delete the project
        projectRepository.delete(project);

        // Optional: Log the deletion
        System.out.println("Project deleted: " + projectId + " by professor: " + professor.getProfessorId());
    }

}