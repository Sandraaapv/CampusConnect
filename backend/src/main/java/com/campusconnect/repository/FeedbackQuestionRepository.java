package com.campusconnect.repository;

import com.campusconnect.model.FeedbackQuestion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FeedbackQuestionRepository extends JpaRepository<FeedbackQuestion, String> {}
