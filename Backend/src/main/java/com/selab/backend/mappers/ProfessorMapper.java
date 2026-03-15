package com.selab.backend.mappers;

import com.selab.backend.Dto.ProfDto;
import com.selab.backend.models.Professor;
import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface ProfessorMapper {
    ProfDto toDto(Professor professor);
}
