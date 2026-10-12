package com.campusconnect.repository;

import com.campusconnect.model.FeedbackSubmission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FeedbackSubmissionRepository extends JpaRepository<FeedbackSubmission, String> {
    List<FeedbackSubmission> findByStudentId(String studentId);
    boolean existsByStudentIdAndFormId(String studentId, String formId);
}
