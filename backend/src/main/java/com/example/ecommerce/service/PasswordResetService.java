package com.example.ecommerce.service;

import java.security.SecureRandom;
import java.time.LocalDateTime;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.ecommerce.model.PasswordResetToken;
import com.example.ecommerce.model.User;
import com.example.ecommerce.repository.PasswordResetTokenRepository;
import com.example.ecommerce.repository.UserRepository;

/**
 * Forgot-password flow:
 * 1. {@link #requestReset} emails a reset code to a registered address.
 * 2. {@link #resetPassword} validates the code and updates the password.
 */
@Service
public class PasswordResetService {

    private static final SecureRandom RANDOM = new SecureRandom();

    @Autowired
    private PasswordResetTokenRepository tokenRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private EmailService emailService;

    @Value("${app.verification.code-expiry-minutes}")
    private int expiryMinutes;

    @Transactional
    public void requestReset(String email) {
        if (email == null || email.isBlank()) {
            throw new RuntimeException("Email is required.");
        }
        User user = userRepository.findByEmail(email);
        // Don't reveal whether the email is registered — only send if it exists.
        if (user == null) {
            return;
        }

        PasswordResetToken token = tokenRepository.findByEmail(email);
        if (token == null) {
            token = new PasswordResetToken();
            token.setEmail(email);
        }
        String code = generateCode();
        token.setCode(code);
        token.setExpiresAt(LocalDateTime.now().plusMinutes(expiryMinutes));
        tokenRepository.save(token);

        try {
            emailService.sendPasswordResetCode(email, code);
        } catch (MailException e) {
            tokenRepository.delete(token);
            throw new RuntimeException("Could not send the reset email. Please try again later.");
        }
    }

    @Transactional
    public void resetPassword(String email, String code, String newPassword) {
        if (email == null || code == null || newPassword == null) {
            throw new RuntimeException("Email, code and new password are required.");
        }
        if (newPassword.length() < 6) {
            throw new RuntimeException("Password must be at least 6 characters long.");
        }

        PasswordResetToken token = tokenRepository.findByEmail(email);
        if (token == null) {
            throw new RuntimeException("Invalid or expired reset code. Please request a new one.");
        }
        if (token.isExpired()) {
            tokenRepository.delete(token);
            throw new RuntimeException("Reset code has expired. Please request a new one.");
        }
        if (!token.getCode().equals(code.trim())) {
            throw new RuntimeException("Invalid reset code.");
        }

        User user = userRepository.findByEmail(email);
        if (user == null) {
            tokenRepository.delete(token);
            throw new RuntimeException("Account not found.");
        }
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        tokenRepository.delete(token);
    }

    private String generateCode() {
        return String.format("%06d", RANDOM.nextInt(1_000_000));
    }
}
