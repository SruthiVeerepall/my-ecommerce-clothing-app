package com.example.ecommerce.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.ecommerce.model.PendingRegistration;

@Repository
public interface PendingRegistrationRepository extends JpaRepository<PendingRegistration, Long> {
    PendingRegistration findByEmail(String email);
    PendingRegistration findByUsername(String username);
}
