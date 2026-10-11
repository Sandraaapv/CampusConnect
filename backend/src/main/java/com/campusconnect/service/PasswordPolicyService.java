package com.campusconnect.service;

import com.campusconnect.model.PasswordHistory;
import com.campusconnect.repository.PasswordHistoryRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;

@Service
public class PasswordPolicyService {

    private static final Set<String> COMMON_PASSWORDS = Set.of(
            "password", "password123", "password@123", "1234567890", "12345678",
            "qwertyuiop", "campusconnect", "college123", "student123", "admin12345",
            "welcome123", "letmein123", "iloveyou123", "monkey1234", "dragon1234",
            "passw0rd123", "campusconnect123"
    );

    private final PasswordHistoryRepository passwordHistoryRepository;
    private final PasswordEncoder passwordEncoder;

    public PasswordPolicyService(PasswordHistoryRepository passwordHistoryRepository, PasswordEncoder passwordEncoder) {
        this.passwordHistoryRepository = passwordHistoryRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public void validatePasswordRules(String password, String identifier, String name) {
        if (password == null || password.length() < 10) {
            throw new IllegalArgumentException("Password must be at least 10 characters long.");
        }

        boolean hasUpper = password.chars().anyMatch(Character::isUpperCase);
        boolean hasLower = password.chars().anyMatch(Character::isLowerCase);
        boolean hasDigit = password.chars().anyMatch(Character::isDigit);
        boolean hasSymbol = password.chars().anyMatch(ch -> !Character.isLetterOrDigit(ch));

        if (!hasUpper || !hasLower || !hasDigit || !hasSymbol) {
            throw new IllegalArgumentException("Password must include uppercase, lowercase, a number, and a special symbol.");
        }

        String lowerPassword = password.toLowerCase();
        if (identifier != null && !identifier.isBlank() && lowerPassword.contains(identifier.toLowerCase().trim())) {
            throw new IllegalArgumentException("Password cannot contain your register number or college ID.");
        }

        if (name != null && !name.isBlank()) {
            String[] parts = name.toLowerCase().split("\\s+");
            for (String part : parts) {
                if (part.length() > 2 && lowerPassword.contains(part)) {
                    throw new IllegalArgumentException("Password cannot contain your name.");
                }
            }
        }

        if (COMMON_PASSWORDS.contains(lowerPassword)) {
            throw new IllegalArgumentException("This password is too common and easily guessed. Please choose a more unique password.");
        }
    }

    public void validatePasswordHistory(String userId, String rawPassword) {
        List<PasswordHistory> history = passwordHistoryRepository.findTop3ByUserIdOrderByCreatedAtDesc(userId);
        for (PasswordHistory ph : history) {
            if (passwordEncoder.matches(rawPassword, ph.getPasswordHash())) {
                throw new IllegalArgumentException("New password must differ from your last 3 passwords.");
            }
        }
    }
}
