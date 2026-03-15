package com.selab.backend.mappers;

import com.selab.backend.Dto.StudentDto;
import com.selab.backend.Dto.UpdateProfileRequest;
import com.selab.backend.models.Student;
import com.selab.backend.models.TeamRole;
import org.hibernate.sql.Update;
import org.mapstruct.*;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface StudentMapper {

    @Mapping(source="teamRole", target="teamRole", qualifiedByName = "getTeamRole")
    StudentDto toDto(Student student);

    @Named("getTeamRole")
    default String getTeamRole(TeamRole teamRole){
        return  teamRole==null? null : teamRole.toString();
    }

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "profilePhotoLink", ignore = true)
    @Mapping(target = "resumePath", ignore = true)
    void updateStudent(UpdateProfileRequest request, @MappingTarget  Student student);
}
