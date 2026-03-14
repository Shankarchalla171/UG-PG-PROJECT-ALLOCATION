package com.selab.backend.mappers;

import com.selab.backend.Dto.ProfDto;
import com.selab.backend.Dto.UpdateProfileRequest;
import com.selab.backend.models.Professor;
import org.mapstruct.*;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface ProfessorMapper {
     @Mapping(source="profilePhotoPath",target="profilePhotoPath")
     ProfDto toDto(Professor professor);

     @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
     @Mapping(target = "profilePhotoPath", ignore = true)
     void updateProf(UpdateProfileRequest request,@MappingTarget  Professor professor);

}
