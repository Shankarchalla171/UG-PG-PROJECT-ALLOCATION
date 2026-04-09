package com.selab.backend.services;

import com.selab.backend.Dto.CreateDeadLineRequest;
import com.selab.backend.Dto.DeadLineDto;
import com.selab.backend.exceptions.ResourceNotFoundException;
import com.selab.backend.exceptions.UserNotFoundException;
import com.selab.backend.mappers.DeadLineMapper;
import com.selab.backend.models.*;
import com.selab.backend.repositories.DeadLineRepository;
import com.selab.backend.repositories.DeptCoordinatorRepository;
import com.selab.backend.repositories.StudentRepository;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class DeadlineService {
    private final DeadLineRepository deadLineRepository;
    private final DeptCoordinatorRepository deptCoordinatorRepository;
    private final DeadLineMapper deadLineMapper;
    private final StudentRepository studentRepository;

    public List<Event> create(@Valid CreateDeadLineRequest request, User user) {
        if(!user.getRole().equals(Role.DEPTCORDINATOR)){
            throw new RuntimeException("only department coordinator can create deadlines");
        }
        DeptCoordinator deptCoordinator=deptCoordinatorRepository.findByUser(user).orElseThrow(()-> new UserNotFoundException("user with email id : "+user.getEmail()+" not found"));

        if(request.getTitle().equals(Phase.TEAM_FORMATION) || request.getTitle().equals(Phase.PROJECT_CREATION)){
             LocalDate allocationStartDate= deadLineRepository.findDeadLineStartDate(deptCoordinator, Phase.PROJECT_ALLOCATION);
             if(allocationStartDate != null && request.getEndDate().isAfter(allocationStartDate))
                   throw new RuntimeException(request.getTitle()+" events can only end before the existing Project Allocation starts..");
        }
        if(request.getTitle().equals(Phase.PROJECT_ALLOCATION)){
            LocalDate teamFormationEndDate = deadLineRepository.findDeadLineEndDate(deptCoordinator,Phase.TEAM_FORMATION);
            LocalDate creationEndDate= deadLineRepository.findDeadLineEndDate(deptCoordinator,Phase.PROJECT_CREATION);

            if(teamFormationEndDate != null && request.getStartDate().isBefore(teamFormationEndDate))
                 throw new RuntimeException("Allocation can only start after TeamFormation and Project Creation end");
            if(creationEndDate != null &&  request.getStartDate().isBefore(creationEndDate))
                 throw new RuntimeException("Allocation can only start after TeamFormation and Project Creation end");
        }
        Event createdDeadLine= Event.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .deptCoordinator(deptCoordinator)
                .lastModified(LocalDate.now())
                .build();
        deadLineRepository.save(createdDeadLine);
        return deadLineRepository.findAllByDeptCoordinator(deptCoordinator);
    }

    public List<Event> getAll(User user) {
        DeptCoordinator deptCoordinator=deptCoordinatorRepository.findByUser(user).orElseThrow(()-> new UserNotFoundException("user with email id : "+user.getEmail()+" not found"));
        return deadLineRepository.findAllByDeptCoordinator(deptCoordinator);
    }

    public void delete(Long id, User user) {
        DeptCoordinator deptCoordinator=deptCoordinatorRepository.findByUser(user).orElseThrow(()-> new UserNotFoundException("user with email id : "+user.getEmail()+" not found"));
        Event currentDeadLine=deadLineRepository.findById(id).orElseThrow(()-> new ResourceNotFoundException("deadline with id : "+ id +" not found"));

        if(!deptCoordinator.getDeptCoordinatorId().equals(currentDeadLine.getDeptCoordinator().getDeptCoordinatorId()))
              throw  new RuntimeException("you can only delete your deadlines");

        deadLineRepository.delete(currentDeadLine);
    }

    public Event update(Long id, User user, DeadLineDto request) {
        DeptCoordinator deptCoordinator=deptCoordinatorRepository.findByUser(user).orElseThrow(()-> new UserNotFoundException("user with email id : "+user.getEmail()+" not found"));
        Event currentDeadLine=deadLineRepository.findById(id).orElseThrow(()-> new ResourceNotFoundException("deadline with id : "+ id +" not found"));

        if(!deptCoordinator.getDeptCoordinatorId().equals(currentDeadLine.getDeptCoordinator().getDeptCoordinatorId()))
            throw  new RuntimeException("That deadLine does not belong to you, you can only update your deadlines..");

        Phase currentPhase = (request.getTitle() != null) ? request.getTitle() : currentDeadLine.getTitle();

        if(request.getEndDate() != null && currentPhase.equals(Phase.TEAM_FORMATION) || currentPhase.equals(Phase.PROJECT_CREATION)){
            LocalDate allocationStartDate= deadLineRepository.findDeadLineStartDate(deptCoordinator, Phase.PROJECT_ALLOCATION);
            if(allocationStartDate != null && request.getEndDate().isAfter(allocationStartDate))
                throw new RuntimeException("events of the "+currentPhase+" phase  can only start or end before the existing events of the  Project Allocation phase start..");
        }
        if(request.getStartDate() != null && currentPhase.equals(Phase.PROJECT_ALLOCATION)){
            LocalDate teamFormationEndDate = deadLineRepository.findDeadLineEndDate(deptCoordinator,Phase.TEAM_FORMATION);
            LocalDate creationEndDate= deadLineRepository.findDeadLineEndDate(deptCoordinator,Phase.PROJECT_CREATION);

            if(teamFormationEndDate != null && request.getStartDate().isBefore(teamFormationEndDate))
                throw new RuntimeException("Events of Allocation phase  can  only start after events of TeamFormation ends");
            if(creationEndDate != null &&  request.getStartDate().isBefore(creationEndDate))
                throw new RuntimeException("Events of the Allocation phase can only after events of Project Creation phase end , please check you team formation and project creation end dates");
        }


        deadLineMapper.updateDeadLine(request,currentDeadLine);
        currentDeadLine.setLastModified(LocalDate.now());
        return deadLineRepository.save(currentDeadLine);
    }

    public DeadLineDto getDetails(Phase title, User user) {
        Student student=studentRepository.findByUser(user).orElseThrow(()-> new UserNotFoundException("student not found with email : "+user.getEmail()));
        String batch=student.getRollNumber().substring(0,3);
        DeptCoordinator coordinator=deptCoordinatorRepository.findByBatch(batch).orElseThrow(() -> new RuntimeException("coordinator not set, event dates not announced"));
        Event event=deadLineRepository.findByDeptCoordinatorAndTitle(coordinator,title).orElseThrow(()-> new ResourceNotFoundException("the event details for not begin announced by the coordinator"));
        return deadLineMapper.toDto(event);
    }
}
