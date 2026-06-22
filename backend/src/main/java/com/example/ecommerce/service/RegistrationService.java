package com.example.ecommerce.service;

import java.security.SecureRandom;
import java.time.LocalDateTime;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.ecommerce.model.PendingRegistration;
import com.example.ecommerce.model.User;
import com.example.ecommerce.repository.PendingRegistrationRepository;
import com.example.ecommerce.repository.UserRepository;

/**
 * Drives the verify-before-create signup flow:
 * 1. {@link #startRegistration} stores the signup as a {@link PendingRegistration} and emails a code.
 * 2. {@link #verifyAndCreate} validates the code and only then creates the real {@link User}.
 * 3. {@link #resendCode} re-issues a code for an existing pending signup.
 */
@Service
public class RegistrationService {

    private static final SecureRandom RANDOM = new SecureRandom();

    @Autowired
    private PendingRegistrationRepository pendingRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private EmailService emailService;

    @Value("${app.verification.code-expiry-minutes}")
    private int expiryMinutes;

    @Transactional
    public void startRegistration(String username, String email, String rawPassword) {
        if (username == null || username.isBlank()
                || email == null || email.isBlank()
                || rawPassword == null || rawPassword.isBlank()) {
            throw new RuntimeException("Username, email and password are required.");
        }
        if (userRepository.findByEmail(email) != null) {
            throw new RuntimeException("An account with this email already exists. Please log in.");
        }
        if (userRepository.findByUsername(username) != null) {
            throw new RuntimeException("This username is already taken.");
        }

        // Reuse the row for this email if the user is re-registering, otherwise create one.
        PendingRegistration pending = pendingRepository.findByEmail(email);
        if (pending == null) {
            pending = new PendingRegistration();
            pending.setEmail(email);
        }
        String code = generateCode();
        pending.setUsername(username);
        pending.setPassword(passwordEncoder.encode(rawPassword));
        pending.setVerificationCode(code);
        pending.setExpiresAt(LocalDateTime.now().plusMinutes(expiryMinutes));
        pending.setRole("USER");
        pendingRepository.save(pending);

        try {
            emailService.sendVerificationCode(email, code);
        } catch (MailException e) {
            // Don't leave a pending row behind if we couldn't actually deliver the code.
            pendingRepository.delete(pending);
            throw new RuntimeException("Could not send the verification email. Please try again later.");
        }
    }

    @Transactional
    public User verifyAndCreate(String email, String code) {
        if (email == null || code == null) {
            throw new RuntimeException("Email and verification code are required.");
        }
        PendingRegistration pending = pendingRepository.findByEmail(email);
        if (pending == null) {
            throw new RuntimeException("No pending registration found for this email. Please register again.");
        }
        if (pending.isExpired()) {
            pendingRepository.delete(pending);
            throw new RuntimeException("Verification code has expired. Please register again.");
        }
        if (!pending.getVerificationCode().equals(code.trim())) {
            throw new RuntimeException("Invalid verification code.");
        }
        // Guard against a duplicate created between registering and verifying.
        if (userRepository.findByEmail(email) != null) {
            pendingRepository.delete(pending);
            throw new RuntimeException("An account with this email already exists. Please log in.");
        }
        if (userRepository.findByUsername(pending.getUsername()) != null) {
            pendingRepository.delete(pending);
            throw new RuntimeException("This username is already taken. Please register again with a different one.");
        }

        User user = new User();
        user.setUsername(pending.getUsername());
        user.setEmail(pending.getEmail());
        user.setPassword(pending.getPassword()); // already encoded
        user.setRole(pending.getRole());
        user.setEmailVerified(true);
        User saved = userRepository.save(user);

        pendingRepository.delete(pending);
        return saved;
    }

    @Transactional
    public void resendCode(String email) {
        if (email == null || email.isBlank()) {
            throw new RuntimeException("Email is required.");
        }
        PendingRegistration pending = pendingRepository.findByEmail(email);
        if (pending == null) {
            throw new RuntimeException("No pending registration found for this email. Please register again.");
        }
        String code = generateCode();
        pending.setVerificationCode(code);
        pending.setExpiresAt(LocalDateTime.now().plusMinutes(expiryMinutes));
        pendingRepository.save(pending);

        try {
            emailService.sendVerificationCode(email, code);
        } catch (MailException e) {
            throw new RuntimeException("Could not send the verification email. Please try again later.");
        }
    }

    private String generateCode() {
        return String.format("%06d", RANDOM.nextInt(1_000_000));
    }
}
