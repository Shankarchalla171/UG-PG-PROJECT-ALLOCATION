package com.selab.backend.mappers;

import com.selab.backend.Dto.ProfDto;
import com.selab.backend.Dto.ProfessorSlotListingDto;
import com.selab.backend.Dto.UpdateProfileRequest;
import com.selab.backend.models.Professor;
import org.mapstruct.*;

import java.util.Arrays;
import java.util.List;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface ProfessorMapper {
     @Mapping(source="profilePhotoPath",target="profilePhotoPath")
     ProfDto toDto(Professor professor);

     @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
     @Mapping(target = "profilePhotoPath", ignore = true)
     void updateProf(UpdateProfileRequest request,@MappingTarget  Professor professor);

     @Mapping(target="domains" ,source = "domain", qualifiedByName = "getDomains")
     ProfessorSlotListingDto toSlotsDto(Professor professor);

     @Named("getDomains")
     default List<String> getDomains(String domain){
          return Arrays.stream(domain.split(","))
                  .map(String::trim)
                  .filter(s -> !s.isEmpty())
                  .toList();
     }

}
