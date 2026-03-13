package com.selab.backend.mappers;

import com.selab.backend.Dto.StudentDto;
import com.selab.backend.models.Student;
import com.selab.backend.models.TeamRole;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface StudentMapper {

    @Mapping(source="teamRole", target="teamRole", qualifiedByName = "getTeamRole")
    StudentDto toDto(Student student);

    @Named("getTeamRole")
    default String getTeamRole(TeamRole teamRole){
        return  teamRole==null? null : teamRole.toString();
    }
}
