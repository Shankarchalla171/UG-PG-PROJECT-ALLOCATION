package com.selab.backend.services;

import com.selab.backend.Dto.RemainderEmail;
import com.selab.backend.exceptions.ResourceNotFoundException;
import com.selab.backend.exceptions.UserNotFoundException;
import com.selab.backend.models.DeptCoordinator;
import com.selab.backend.models.Event;
import com.selab.backend.models.User;
import com.selab.backend.repositories.DeadLineRepository;
import com.selab.backend.repositories.DeptCoordinatorRepository;
import com.selab.backend.repositories.StudentRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class NotificationService {
    private final StudentRepository studentRepository;
    private final EmailService emailService;
    private final DeptCoordinatorRepository deptCoordinatorRepository;
    private final DeadLineRepository deadLineRepository;


    public void sendRemainder(RemainderEmail content, User user,Long id){
        DeptCoordinator coordinator= deptCoordinatorRepository.findByUser(user).orElseThrow(()-> new UserNotFoundException("coordinator with email : "+ user.getEmail()+ " not found"));
        Event event= deadLineRepository.findById(id).orElseThrow(()-> new ResourceNotFoundException("event with id: "+ id+" not found"));

        if(!event.getDeptCoordinator().equals(coordinator)){
            throw new RuntimeException("you can only send reminders to events that belong to you..");
        }
        List<String> emails= studentRepository.getAllEmailsByDepartmentNameAndBatch(coordinator.getDeptName(), content.getBatch().toUpperCase()+"%");


        for(String email:emails){
            emailService.sendRemainerMail(email,content.getSubject(),content.getBody());
            System.out.println("remainder email sent successfully to email : " + email);
        }
    }
}
