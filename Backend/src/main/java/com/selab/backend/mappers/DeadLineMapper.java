package com.selab.backend.mappers;

import com.selab.backend.Dto.DeadLineDto;
import com.selab.backend.models.Event;
import org.mapstruct.*;

import java.time.LocalDate;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface DeadLineMapper {
    @Mapping(target="status", expression = "java(getStatus(deadLine.getStartDate(),deadLine.getEndDate()))")
    DeadLineDto toDto(Event deadLine);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateDeadLine(DeadLineDto request, @MappingTarget Event deadLine);

    default  String getStatus(LocalDate startDate, LocalDate endDate){
        LocalDate today = LocalDate.now();
        if( (startDate == null || !today.isBefore(startDate)) && !today.isAfter(endDate))
            return "Active";
        else if(startDate != null && today.isBefore(startDate))
              return "Upcoming";
        else
            return "Passed";
    }
}
