package com.selab.backend.services;
import com.selab.backend.models.EmailDetails;


public interface EmailServiceInterface {

    String sendSimpleMail(EmailDetails details);

    void sendVerificationEmail(String to, String username, String token);
    String sendMailWithAttachment(EmailDetails details);

}
