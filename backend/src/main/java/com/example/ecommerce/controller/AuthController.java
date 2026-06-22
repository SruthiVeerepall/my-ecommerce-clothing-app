package com.example.ecommerce.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

import com.example.ecommerce.model.User;
import com.example.ecommerce.service.JwtUtil;
import com.example.ecommerce.service.PasswordResetService;
import com.example.ecommerce.service.RegistrationService;
import com.example.ecommerce.service.UserService;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserService userService;

    @Autowired
    private RegistrationService registrationService;

    @Autowired
    private PasswordResetService passwordResetService;

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {
        try {
            registrationService.startRegistration(user.getUsername(), user.getEmail(), user.getPassword());
            return ResponseEntity.ok(Map.of(
                    "message", "A verification code has been sent to " + user.getEmail() + ".",
                    "email", user.getEmail()));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/verify-email")
    public ResponseEntity<?> verifyEmail(@RequestBody Map<String, String> body) {
        try {
            registrationService.verifyAndCreate(body.get("email"), body.get("code"));
            return ResponseEntity.ok(Map.of("message", "Your account has been created. You can now log in."));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/resend-code")
    public ResponseEntity<?> resendCode(@RequestBody Map<String, String> body) {
        try {
            registrationService.resendCode(body.get("email"));
            return ResponseEntity.ok(Map.of("message", "A new verification code has been sent."));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> body) {
        try {
            passwordResetService.requestReset(body.get("email"));
            // Always generic to avoid revealing whether the email is registered.
            return ResponseEntity.ok(Map.of(
                    "message", "If an account exists for that email, a reset code has been sent."));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> body) {
        try {
            passwordResetService.resetPassword(body.get("email"), body.get("code"), body.get("password"));
            return ResponseEntity.ok(Map.of("message", "Your password has been reset. You can now log in."));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User user) {
        String identifier = user.getEmail() != null ? user.getEmail() : user.getUsername();
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(identifier, user.getPassword()));
        } catch (BadCredentialsException e) {
            return ResponseEntity.status(401)
                    .body(java.util.Map.of("message", "Incorrect username or password"));
        }

        final UserDetails userDetails = userService.loadUserByUsername(identifier);
        final String jwt = jwtUtil.generateToken(userDetails);
        
        String role = "USER";
        Long userId = null;
        if (userDetails instanceof User) {
            role = ((User) userDetails).getRole();
            userId = ((User) userDetails).getId();
        }

        return ResponseEntity.ok(new AuthenticationResponse(jwt, role, userId));
    }

    @PostMapping("/register-admin")
    public ResponseEntity<?> registerAdmin(@RequestBody User user) {
        // Check if user is authenticated and has ADMIN role, or if no admins exist
        boolean isAuthenticatedAdmin = false;
        if (SecurityContextHolder.getContext().getAuthentication() != null &&
            SecurityContextHolder.getContext().getAuthentication().isAuthenticated()) {
            Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
            if (principal instanceof User) {
                User currentUser = (User) principal;
                if ("ADMIN".equals(currentUser.getRole())) {
                    isAuthenticatedAdmin = true;
                }
            }
        }
        boolean noAdminsExist = !userService.adminExists();

        if (!isAuthenticatedAdmin && !noAdminsExist) {
            return ResponseEntity.status(403).body("Access denied: Admin privileges required or no admins exist");
        }

        try {
            user.setRole("ADMIN");
            User savedUser = userService.register(user);
            return ResponseEntity.ok(savedUser);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Admin registration failed: " + e.getMessage());
        }
    }

    // Inner class for response
    public static class AuthenticationResponse {
        private final String jwt;
        private final String role;
        private final Long userId;

        public AuthenticationResponse(String jwt, String role, Long userId) {
            this.jwt = jwt;
            this.role = role;
            this.userId = userId;
        }

        public String getJwt() {
            return jwt;
        }

        public String getRole() {
            return role;
        }

        public Long getUserId() {
            return userId;
        }
    }
}