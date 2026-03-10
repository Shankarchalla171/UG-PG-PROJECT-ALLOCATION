package com.selab.backend.mappers;

import com.selab.backend.Dto.ProfProfileResponse;
import com.selab.backend.models.Professor;
import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface ProfMapper {
    ProfProfileResponse toDto(Professor professor);
}
