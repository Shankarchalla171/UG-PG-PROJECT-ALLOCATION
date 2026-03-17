package com.selab.backend.services;

import com.selab.backend.Dto.ProjectListingDto;
import com.selab.backend.models.Project;
import com.selab.backend.models.Student;
import com.selab.backend.repositories.ProjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProjectService {

    private final ProjectRepository projectRepository;

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
                    project.getPreRequesites()
            );

            dto.setAvailableSlots(
                    project.getSlots()
            );

            return dto;

        }).toList();
    }
}