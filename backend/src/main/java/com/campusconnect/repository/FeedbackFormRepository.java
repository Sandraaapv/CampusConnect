package com.campusconnect.repository;

import com.campusconnect.model.FeedbackForm;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FeedbackFormRepository extends JpaRepository<FeedbackForm, String> {
    List<FeedbackForm> findByStatusNot(String status);
}
