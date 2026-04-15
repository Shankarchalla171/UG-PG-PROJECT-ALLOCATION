package com.selab.backend.services;

import com.selab.backend.models.EmailDetails;
import com.selab.backend.models.Professor;
import com.selab.backend.models.Project;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.util.StreamUtils;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Optional;
import java.util.Properties;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService implements EmailServiceInterface {

    private final JavaMailSender javaMailSender;

    @Value("${spring.mail.username}")
    private String sender;
    @Value("${frontendUrl}")
    private String baseUrl;

    private String loadEmailTemplate() {
        try {
            ClassPathResource resource = new ClassPathResource("templates/email-verification.html");
            byte[] bytes = StreamUtils.copyToByteArray(resource.getInputStream());
            return new String(bytes, StandardCharsets.UTF_8);
        } catch (IOException e) {
            log.error("Failed to load email template", e);
            throw new RuntimeException("Failed to load email template", e);
        }
    }

    private String loadOtpTemplate() {
        try {
            ClassPathResource resource = new ClassPathResource("templates/otp-template.html");
            byte[] bytes = StreamUtils.copyToByteArray(resource.getInputStream());
            return new String(bytes, StandardCharsets.UTF_8);
        } catch (IOException e) {
            log.error("Failed to load email template", e);
            throw new RuntimeException("Failed to load email template", e);
        }
    }

    @Override
    public void sendVerificationEmail(String to, String username, String token) {
        try {
            MimeMessage message = javaMailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(sender);
            helper.setTo(to);
            helper.setSubject("Verify Your Email - EduProject");

            String verificationLink = baseUrl + "/verify-email?token=" + token;

            // Load and populate template
            String template = loadEmailTemplate();
            String emailContent = template
                    .replace("${username}", username)
                    .replace("${verificationLink}", verificationLink);

            helper.setText(emailContent, true);

            javaMailSender.send(message);
            log.info("Verification email sent to: {}", to);

        } catch (MessagingException e) {
            log.error("Failed to send verification email to: {}", to, e);
            throw new RuntimeException("Failed to send verification email", e);
        }
    }

    public void sendOtpEmail(String to, String username, int otp) {
        try {
            MimeMessage message = javaMailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(sender);
            helper.setTo(to);
            helper.setSubject("Account Recovery - EduProject");


            // Load and populate template
            String template = loadOtpTemplate();
            String emailContent = template
                    .replace("${username}", username)
                    .replace("${otp}", String.valueOf(otp));

            helper.setText(emailContent, true);

            javaMailSender.send(message);
            log.info("Verification email sent to: {}", to);

        } catch (MessagingException e) {
            log.error("Failed to send verification email to: {}", to, e);
            throw new RuntimeException("Failed to send verification email", e);
        }
    }

    @Override
    public String sendSimpleMail(EmailDetails details) {
        return "";
    }

    @Override
    public String sendMailWithAttachment(EmailDetails details) {
        return "";
    }

    @Override
    public void sendRemainerMail(String to, String subject, String body) {

        SimpleMailMessage mailMessage= new SimpleMailMessage();

        mailMessage.setTo(to);
        mailMessage.setSubject(subject);
        mailMessage.setText(body);

        javaMailSender.send(mailMessage);
    }

     private String loadInvitationTemplate(){
         try {
             ClassPathResource resource = new ClassPathResource("templates/Invitation.html");
             byte[] bytes = StreamUtils.copyToByteArray(resource.getInputStream());
             return new String(bytes, StandardCharsets.UTF_8);
         } catch (IOException e) {
             log.error("Failed to load email template", e);
             throw new RuntimeException("Failed to load email template", e);
         }
     }

    @Override
    public void sendCollaboratioMail(Project project, Professor senderP, Professor receiver) {
        try{
            MimeMessage message = javaMailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(sender);
            helper.setTo(receiver.getEmail());
            helper.setSubject("New Collaboration Request");

            // Load and populate template
            String template = loadInvitationTemplate();
            String emailContent = template
                    .replace("${receiverName}", receiver.getName())
                    .replace("${senderName}", senderP.getName())
                    .replace("${department}", senderP.getDepartmentName())
                    .replace("${projectTitle}", project.getTitle())
                    .replace("${projectDescription}", project.getDescription())
                    .replace("${peopleNeeded}", String.valueOf(project.getSlots()))
                    .replace("${domains}",
                            Optional.ofNullable(project.getDomain()).orElse("N/A"));


            helper.setText(emailContent, true);

            javaMailSender.send(message);
            log.info("Invitation email sent to: {}", receiver.getEmail());

        }catch (MessagingException e) {
            log.error("Failed to send collaboration email to: {}", receiver.getName(), e);
            throw new RuntimeException("Failed to send collaboration email", e);
        }
    }
}