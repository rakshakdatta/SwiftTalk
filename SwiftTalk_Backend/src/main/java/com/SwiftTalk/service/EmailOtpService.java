package com.SwiftTalk.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailOtpService {

    @Autowired
    private JavaMailSender mailSender;

    // Reads sender email from application.properties (spring.mail.from)
    @Value("${spring.mail.from}")
    private String fromEmail;

    public void sendOtpToEmail(String toEmail, String otp) {
        if (fromEmail.isBlank()) {
            throw new IllegalStateException("Email verification is currently unavailable.");
        }

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(toEmail);
        message.setSubject("Your SwiftTalk verification code");
        message.setText("Your SwiftTalk verification code is " + otp + ". It expires in 10 minutes.");
        message.setFrom(fromEmail);
        try {
            mailSender.send(message);
        } catch (MailException ex) {
            throw new IllegalStateException("Could not send the email. Please try again.", ex);
        }
    }
}
