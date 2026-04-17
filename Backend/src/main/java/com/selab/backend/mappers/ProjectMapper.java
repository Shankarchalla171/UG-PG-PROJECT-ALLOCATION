package com.selab.backend.mappers;

import com.selab.backend.Dto.ProjectResponseDto;
import com.selab.backend.Dto.ProjectUpdateDto;
import com.selab.backend.models.Project;
import org.mapstruct.*;

@Mapper(componentModel = "spring",
        unmappedTargetPolicy = ReportingPolicy.IGNORE,
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE,
        uses = {ProfessorMapper.class})  // Include ProfessorMapper
public interface ProjectMapper {

    // For updating existing project - only update non-null fields
    @Mapping(target = "preRequisites", source = "prerequisites")  // Map DTO.prerequisites → Entity.preRequesites
    @Mapping(target = "projectId", ignore = true)           // Never update ID
    @Mapping(target = "professor", ignore = true)           // Never update professor
    @Mapping(target = "applications", ignore = true)        // Never update applications
    void updateProjectFromDto(ProjectUpdateDto dto, @MappingTarget Project project);

    // For converting to response DTO
    @Mapping(target = "prerequisites", source = "preRequisites")  // Map Entity.preRequesites → DTO.prerequisites
    ProjectResponseDto toResponseDto(Project project);

}