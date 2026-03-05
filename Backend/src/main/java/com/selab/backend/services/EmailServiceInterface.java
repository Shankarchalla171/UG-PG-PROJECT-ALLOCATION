package com.selab.backend.services;
import com.SpringBootEmail.Entity.EmailDetails;


public interface EmailService {

    String sendSimpleMail(EmailDetails details);

    
    String sendMailWithAttachment(EmailDetails details);

}
