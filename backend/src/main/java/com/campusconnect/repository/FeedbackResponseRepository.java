package com.campusconnect.repository;

import com.campusconnect.model.FeedbackResponse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FeedbackResponseRepository extends JpaRepository<FeedbackResponse, String> {
    List<FeedbackResponse> findByFormId(String formId);
}
