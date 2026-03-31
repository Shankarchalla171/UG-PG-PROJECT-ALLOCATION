package com.selab.backend.services;

import com.selab.backend.Dto.CollaborationDto;
import com.selab.backend.Dto.CollaborationRequest;
import com.selab.backend.exceptions.ResourceNotFoundException;
import com.selab.backend.exceptions.UserNotFoundException;
import com.selab.backend.models.*;
import com.selab.backend.repositories.CollaborationRepository;
import com.selab.backend.repositories.ProfessorRepository;
import com.selab.backend.repositories.ProjectRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.jspecify.annotations.NonNull;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class CollaborationService {
    private final ProfessorRepository professorRepository;
    private final CollaborationRepository collaborationRepository;
    private final ProjectRepository projectRepository;
    private final EmailService emailService;


    public void invite(User user, CollaborationRequest request) {
        Professor sender= professorRepository.findByUser(user).orElseThrow(()-> new UserNotFoundException("only professors can send invitation to other faculty"));

        Professor receiver=professorRepository.findByProfessorId(request.getReceiverId()).orElseThrow(()->new RuntimeException("Collaboration invitation can only to sent to professors"));

        Project project=projectRepository.findById(request.getProjectId()).orElseThrow(()-> new ResourceNotFoundException("project with Project Id : "+request.getProjectId()+" not found"));

        if(!project.getProfessor().equals(sender))
            throw new RuntimeException("Invitation can only be sent to your Projects");
        if(!sender.getDepartmentName().equals(receiver.getDepartmentName()))
             throw new RuntimeException("Invitation can only be sent to faculties of the same departments");

        Collaboration collaboration=Collaboration.builder()
                .project(project)
                .sender(sender)
                .receiver(receiver)
                .status(CollaborationStatus.PENDING)
                .build();

        collaborationRepository.save(collaboration);
        emailService.sendCollaboratioMail(project,sender,receiver);

    }

    @NonNull
    private List<CollaborationDto> getCollaborationDtos(List<Collaboration> sentCollaborations) {
        List<CollaborationDto> collaborationDtos= new ArrayList<>();

        for(Collaboration collaboration : sentCollaborations){
            CollaborationDto collaborationDto=CollaborationDto.builder()
                    .id(collaboration.getId())
                    .projectTitle(collaboration.getProject().getTitle())
                    .receiverName(collaboration.getReceiver().getName())
                    .senderName(collaboration.getSender().getName())
                    .status(collaboration.getStatus().toString())
                    .build();
            collaborationDtos.add(collaborationDto);
        }
        return collaborationDtos;
    }

    public List<CollaborationDto> getAll(User user, Boolean sent) {
        if(sent) {
            Professor sender = professorRepository.findByUser(user).orElseThrow(() -> new UserNotFoundException("user is not a professor"));
            List<Collaboration> sentCollaborations = collaborationRepository.findAllBySender(sender);
            return getCollaborationDtos(sentCollaborations);
        }else{
            Professor receiver = professorRepository.findByUser(user).orElseThrow(()-> new UserNotFoundException("user is not a professor"));
            List<Collaboration> sentCollaborations=collaborationRepository.findAllByReceiver(receiver);
            return getCollaborationDtos(sentCollaborations);
        }
    }

    public void response(User user, Long collaborationId, Boolean accept) {
        Professor receiver=professorRepository.findByUser(user).orElseThrow(() -> new UserNotFoundException("user is not a professor"));
        Collaboration collaboration=collaborationRepository.findById(collaborationId).orElseThrow(()-> new ResourceNotFoundException("Collaboration not found"));

        if(!collaboration.getReceiver().equals(receiver))
             throw new RuntimeException("You can only Respond to collaborations which you have received");
        collaboration.setStatus(accept? CollaborationStatus.ACCEPTED: CollaborationStatus.REJECTED);
        if(accept){
            Project project=collaboration.getProject();
            project.setCoGuide(receiver);
            projectRepository.save(project);
        }
    }
}
