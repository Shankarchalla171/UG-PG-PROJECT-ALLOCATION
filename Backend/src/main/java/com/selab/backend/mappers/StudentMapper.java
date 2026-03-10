package com.selab.backend.mappers;

import com.selab.backend.models.Student;
import com.selab.backend.student.StudentProfileResponse;
import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface StudentMapper {
    StudentProfileResponse toDto(Student student);
}
