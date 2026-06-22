package com.example.ecommerce.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Value("${app.verification.from-address}")
    private String fromAddress;

    @Value("${app.verification.code-expiry-minutes}")
    private int expiryMinutes;

    public void sendVerificationCode(String toEmail, String code) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromAddress);
        message.setTo(toEmail);
        message.setSubject("Your VR Boutique verification code");
        message.setText(
                "Welcome to VR Boutique!\n\n"
                        + "Your verification code is: " + code + "\n\n"
                        + "Enter this code in the app to finish creating your account.\n"
                        + "The code expires in " + expiryMinutes + " minutes.\n\n"
                        + "If you didn't request this, you can ignore this email.");
        mailSender.send(message);
    }
}
