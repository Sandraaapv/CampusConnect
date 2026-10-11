package com.campusconnect.repository;

import com.campusconnect.model.StudentRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface StudentRecordRepository extends JpaRepository<StudentRecord, Long> {
    Optional<StudentRecord> findByRegisterNumberIgnoreCase(String registerNumber);
    boolean existsByRegisterNumberIgnoreCase(String registerNumber);
    Optional<StudentRecord> findByEmailIgnoreCase(String email);
    Optional<StudentRecord> findByRegisterNumberIgnoreCaseAndEmailIgnoreCase(String registerNumber, String email);
}
