package com.campusconnect.config;

import com.campusconnect.model.PasswordHistory;
import com.campusconnect.model.StudentRecord;
import com.campusconnect.model.User;
import com.campusconnect.repository.PasswordHistoryRepository;
import com.campusconnect.repository.StudentRecordRepository;
import com.campusconnect.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final StudentRecordRepository studentRecordRepository;
    private final UserRepository userRepository;
    private final PasswordHistoryRepository passwordHistoryRepository;
    private final PasswordEncoder passwordEncoder;
    private final String collegeDomain;

    public DataInitializer(
            StudentRecordRepository studentRecordRepository,
            UserRepository userRepository,
            PasswordHistoryRepository passwordHistoryRepository,
            PasswordEncoder passwordEncoder,
            @Value("${campusconnect.college-email-domain:campus.test}") String collegeDomain) {
        this.studentRecordRepository = studentRecordRepository;
        this.userRepository = userRepository;
        this.passwordHistoryRepository = passwordHistoryRepository;
        this.passwordEncoder = passwordEncoder;
        this.collegeDomain = collegeDomain.startsWith("@") ? collegeDomain.substring(1) : collegeDomain;
    }

    @Override
    public void run(String... args) {
        log.info("Checking official student records for demo domain: {}", collegeDomain);

        // Ensure baseline demo records exist
        upsertRecord("21CS042", "student.demo@" + collegeDomain, "Arjun Verma", "Computer Science & Engineering", 6);
        upsertRecord("21CSC105", "ananya.sen@" + collegeDomain, "Ananya Sen", "Computer Science & Engineering", 6);
        upsertRecord("21CS077", "rohit.sharma@" + collegeDomain, "Rohit Sharma", "Computer Science & Engineering", 6);
        upsertRecord("21EC034", "vikram.mehta@" + collegeDomain, "Vikram Mehta", "Electronics & Communication", 6);
        upsertRecord("21ME019", "sneha.patel@" + collegeDomain, "Sneha Patel", "Mechanical Engineering", 6);

        // Seed registered demo student user (21CS042)
        String demoEmail = "student.demo@" + collegeDomain;
        studentRecordRepository.findByRegisterNumberIgnoreCase("21CS042").ifPresent(record -> {
            String demoPasswordHash = passwordEncoder.encode("StudentDemo@2026!");
            userRepository.findByIdentifier("21CS042").ifPresentOrElse(user -> {
                user.setPasswordHash(demoPasswordHash);
                user.setEmailVerifiedAt(LocalDateTime.now());
                user.setFailedAttempts(0);
                user.setLockedUntil(null);
                userRepository.save(user);
                log.info("Refreshed password hash for demo account: 21CS042");
            }, () -> {
                log.info("Seeding registered demo student account: 21CS042 ({})", demoEmail);
                User demoUser = new User("usr-demo-21cs042", record, demoEmail, demoPasswordHash);
                demoUser.setEmailVerifiedAt(LocalDateTime.now());
                userRepository.save(demoUser);
                passwordHistoryRepository.save(new PasswordHistory("usr-demo-21cs042", demoPasswordHash));
            });
        });

        // Seed registered account for Rohit Sharma (21CS077)
        String rohitEmail = "rohit.sharma@" + collegeDomain;
        studentRecordRepository.findByRegisterNumberIgnoreCase("21CS077").ifPresent(record -> {
            String rohitPasswordHash = passwordEncoder.encode("Password@123");
            userRepository.findByIdentifier("21CS077").ifPresentOrElse(user -> {
                user.setPasswordHash(rohitPasswordHash);
                user.setEmailVerifiedAt(LocalDateTime.now());
                user.setFailedAttempts(0);
                user.setLockedUntil(null);
                userRepository.save(user);
                log.info("Refreshed password hash for demo account: 21CS077");
            }, () -> {
                log.info("Seeding registered demo student account: 21CS077 ({})", rohitEmail);
                User rohitUser = new User("usr-demo-21cs077", record, rohitEmail, rohitPasswordHash);
                rohitUser.setEmailVerifiedAt(LocalDateTime.now());
                userRepository.save(rohitUser);
                passwordHistoryRepository.save(new PasswordHistory("usr-demo-21cs077", rohitPasswordHash));
            });
        });
    }

    private void upsertRecord(String regNo, String email, String name, String dept, int sem) {
        if (!studentRecordRepository.existsByRegisterNumberIgnoreCase(regNo)) {
            studentRecordRepository.save(new StudentRecord(regNo, email, name, dept, sem));
            log.info("Seeded student record: {} ({})", regNo, name);
        }
    }
}
