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
import com.selab.backend.repositories.ProjectApplicationsRepository;
import com.selab.backend.repositories.ProjectRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;
import com.selab.backend.Dto.ProjectUpdateDto;

import com.selab.backend.exceptions.AccessDeniedException;

import org.springframework.data.domain.Pageable;

import java.util.*;
import java.util.stream.Collectors;

import org.springframework.data.jpa.domain.Specification;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Subquery;
import jakarta.persistence.criteria.Root;

@Service
@RequiredArgsConstructor
public class ProjectService {
    private final ProjectRepository projectRepository;
    private final ProfessorRepository professorRepository;
    private final ProfessorMapper professorMapper;
    private final ProjectMapper projectMapper;
    private  final DeptCoordinatorRepository deptCoordinatorRepository;
    private final ProjectApplicationsRepository projectApplicationsRepository;

    private Specification<Project> buildSpecification(
            Team team,
            String department,
            String search,
            String domain,
            String faculty,
            String slots,
            String applicationStatus
    ) {
        return (root, query, cb) -> {

            List<Predicate> predicates = new ArrayList<>();

            // DEPARTMENT FILTER (MANDATORY)
            if (department != null && !department.isEmpty()) {
                predicates.add(
                        cb.equal(
                                root.get("professor").get("departmentName"), // ⚠️ check field name
                                department
                        )
                );
            }

            // Exclude already applied projects
            if (team != null) {
                Subquery<Long> subquery = query.subquery(Long.class);
                Root<ProjectApplications> pa = subquery.from(ProjectApplications.class);

                subquery.select(pa.get("project").get("projectId"))
                        .where(cb.equal(pa.get("team"), team));

                if ("NOT_APPLIED".equalsIgnoreCase(applicationStatus)) {
                    predicates.add(cb.not(root.get("projectId").in(subquery)));
                } else if ("APPLIED".equalsIgnoreCase(applicationStatus)) {
                    predicates.add(root.get("projectId").in(subquery));
                }
            }

            // MULTI-WORD SEARCH
            if (search != null && !search.isEmpty()) {
                String[] words = search.trim().toLowerCase().split("\\s+");

                for (String word : words) {
                    Predicate titleMatch = cb.like(
                            cb.lower(root.get("title")),
                            "%" + word + "%"
                    );

                    Predicate descMatch = cb.like(
                            cb.lower(root.get("description")),
                            "%" + word + "%"
                    );

                    predicates.add(cb.or(titleMatch, descMatch));
                }
            }

            // DOMAIN
            if (domain != null && !domain.isEmpty()) {
                predicates.add(cb.like(
                        cb.lower(root.get("domain")),
                        "%" + domain.toLowerCase() + "%"
                ));
            }

            // FACULTY
            if (faculty != null && !faculty.isEmpty()) {
                predicates.add(cb.equal(
                        cb.lower(root.get("professor").get("name")),
                        faculty.toLowerCase()
                ));
            }

            // SLOTS
            if (slots != null && !slots.equals("all")) {
                if (slots.equals("available")) {
                    predicates.add(cb.greaterThan(root.get("slots"), 0));
                } else if (slots.equals("full")) {
                    predicates.add(cb.equal(root.get("slots"), 0));
                } else {
                    // Handle numeric values (1,2,3)
                    try {
                        int slotValue = Integer.parseInt(slots);
                        predicates.add(cb.equal(root.get("slots"), slotValue));
                    } catch (NumberFormatException e) {
                        // ignore invalid values
                    }
                }
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }


    public Page<ProjectListingDto> getProjectListings(
            Student student,
            Pageable pageable,
            String search,
            String domain,
            String faculty,
            String slots,
            String applicationStatus
    ) {

        if(student.getTeamRole() == null){
            Page<Project> projects;
            projects = projectRepository.findAll(pageable);
            int teamSize = 0;
            return projects.map(project -> {

                        ProjectListingDto dto = new ProjectListingDto();

                        dto.setId(project.getProjectId());
                        dto.setProjectTitle(project.getTitle());
                        dto.setDescription(project.getDescription());
                        dto.setFacultyName(project.getProfessor().getName());
                        if (project.getDomain() != null && !project.getDomain().isEmpty()) {
                            dto.setDomains(
                                    Arrays.stream(project.getDomain().split(","))
                                            .map(String::trim)
                                            .filter(s -> !s.isEmpty())
                                            .toList()
                            );
                        } else {
                            dto.setDomains(new ArrayList<>());
                        }
                        dto.setDuration(project.getDuration());
                        dto.setPreRequisites(project.getPreRequisites());
                        dto.setAvailableSlots(project.getSlots());
                        dto.setTeamSize(teamSize);

                        // Default values
                        dto.setAppliedOn(null);
                        dto.setApplied(false);
                        dto.setTeamConfirmed(false);

                        return dto;
            });
        }

        Specification<Project> spec = buildSpecification(
                student.getTeam(),
                student.getDepartmentName(),
                search,
                domain,
                faculty,
                slots,
                applicationStatus
        );

        Page<Project> projects = projectRepository.findAll(spec, pageable);

        boolean isConfirmed = isTeamAlreadyConfirmed(student.getTeam());

        int teamSize = student.getTeam().getTeamMembers().size();

        return projects.map(project -> {
            ProjectListingDto dto = new ProjectListingDto();

            dto.setId(project.getProjectId());
            dto.setProjectTitle(project.getTitle());
            dto.setDescription(project.getDescription());
            dto.setFacultyName(project.getProfessor().getName());

            if (project.getDomain() != null && !project.getDomain().isEmpty()) {
                dto.setDomains(
                        Arrays.stream(project.getDomain().split(","))
                                .map(String::trim)
                                .filter(s -> !s.isEmpty())
                                .toList()
                );
            } else {
                dto.setDomains(new ArrayList<>());
            }
            dto.setDuration(project.getDuration());
            dto.setPreRequisites(project.getPreRequisites());
            dto.setAvailableSlots(project.getSlots());
            dto.setTeamConfirmed(isConfirmed);
            dto.setApplied(projectApplicationsRepository.existsByProjectAndTeam(project,student.getTeam()));
            dto.setTeamSize(teamSize);

            return dto;
        });
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

    public Map<String, List<String>> getProjectFilters(Student student) {

        String department = student.getDepartmentName();

        Team team = student.getTeam();

        List<String> rawDomains = projectRepository.findDistinctDomains(department);
        List<String> faculty = projectRepository.findDistinctFaculty(department);

        // Split comma-separated domains
        Set<String> domainSet = new HashSet<>();

        for (String d : rawDomains) {
            if (d != null && !d.trim().isEmpty()) {
                String[] split = d.split(",");
                for (String s : split) {
                    if (!s.trim().isEmpty()) {
                        domainSet.add(s.trim());
                    }
                }
            }
        }

        List<String> domains = new ArrayList<>(domainSet);


        Map<String, List<String>> response = new HashMap<>();
        response.put("domains", domains);
        response.put("faculty", faculty);

        return response;
    }

    private boolean isTeamAlreadyConfirmed(Team team) {

        if (team == null) {
            System.out.println("TEAM IS NULL");
            return false;
        }

        return projectApplicationsRepository.existsConfirmed(
                team.getTeamId(),
                ApplicationStatus.TEAM_CONFIRMED
        );
    }

}