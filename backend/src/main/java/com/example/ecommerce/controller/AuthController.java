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

import com.example.ecommerce.model.User;
import com.example.ecommerce.service.JwtUtil;
import com.example.ecommerce.service.UserService;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserService userService;

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {
        try {
            User savedUser = userService.register(user);
            return ResponseEntity.ok(savedUser);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Registration failed: " + e.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User user) {
        String identifier = user.getEmail() != null ? user.getEmail() : user.getUsername();
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(identifier, user.getPassword()));
        } catch (BadCredentialsException e) {
            return ResponseEntity.badRequest().body("Incorrect email or password");
        }

        final UserDetails userDetails = userService.loadUserByUsername(identifier);
        final String jwt = jwtUtil.generateToken(userDetails);
        
        String role = "USER";
        if (userDetails instanceof User) {
            role = ((User) userDetails).getRole();
        }

        return ResponseEntity.ok(new AuthenticationResponse(jwt, role));
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

        public AuthenticationResponse(String jwt, String role) {
            this.jwt = jwt;
            this.role = role;
        }

        public String getJwt() {
            return jwt;
        }

        public String getRole() {
            return role;
        }
    }
}