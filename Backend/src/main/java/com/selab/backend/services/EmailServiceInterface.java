package com.selab.backend.services;
import com.selab.backend.models.EmailDetails;
import com.selab.backend.models.Professor;
import com.selab.backend.models.Project;


public interface EmailServiceInterface {

    String sendSimpleMail(EmailDetails details);

    void sendVerificationEmail(String to, String username, String token);
    String sendMailWithAttachment(EmailDetails details);

    void sendRemainerMail(String to,String subject, String body);
    void sendCollaboratioMail(Project project, Professor senderP, Professor receiver);
}
