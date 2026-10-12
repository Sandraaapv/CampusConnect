package com.campusconnect.repository;

import com.campusconnect.model.StudentBadge;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentBadgeRepository extends JpaRepository<StudentBadge, Long> {
    List<StudentBadge> findByStudentId(String studentId);
    Optional<StudentBadge> findByStudentIdAndBadgeId(String studentId, String badgeId);
}
