package com.campusconnect.service;

import com.campusconnect.model.FeedbackForm;
import com.campusconnect.model.FeedbackQuestion;
import com.campusconnect.model.FeedbackResponse;
import com.campusconnect.model.FeedbackSubmission;
import com.campusconnect.repository.FeedbackFormRepository;
import com.campusconnect.repository.FeedbackQuestionRepository;
import com.campusconnect.repository.FeedbackResponseRepository;
import com.campusconnect.repository.FeedbackSubmissionRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.*;

@Service
public class FeedbackService {

    private final FeedbackFormRepository formRepository;
    private final FeedbackQuestionRepository questionRepository;
    private final FeedbackSubmissionRepository submissionRepository;
    private final FeedbackResponseRepository responseRepository;
    private final ObjectMapper objectMapper;

    public FeedbackService(
            FeedbackFormRepository formRepository,
            FeedbackQuestionRepository questionRepository,
            FeedbackSubmissionRepository submissionRepository,
            FeedbackResponseRepository responseRepository) {
        this.formRepository = formRepository;
        this.questionRepository = questionRepository;
        this.submissionRepository = submissionRepository;
        this.responseRepository = responseRepository;
        this.objectMapper = new ObjectMapper();
    }

    public List<FeedbackForm> getFormsForStudent(String studentId) {
        List<FeedbackForm> forms = formRepository.findAll();
        Set<String> submittedFormIds = new HashSet<>();
        for (FeedbackSubmission s : submissionRepository.findByStudentId(studentId)) {
            submittedFormIds.add(s.getFormId());
        }

        List<FeedbackForm> result = new ArrayList<>();
        for (FeedbackForm f : forms) {
            FeedbackForm copy = new FeedbackForm(
                    f.getId(), f.getSubjectId(), f.getSubjectCode(), f.getSubjectName(),
                    f.getFacultyId(), f.getFacultyName(), f.getOpensAt(), f.getClosesAt(),
                    submittedFormIds.contains(f.getId()) ? "submitted" : f.getStatus()
            );
            result.add(copy);
        }
        return result;
    }

    public List<FeedbackQuestion> getQuestions() {
        return questionRepository.findAll();
    }

    @Transactional
    public Map<String, Object> submitFeedback(String studentId, String formId, Map<String, Integer> answers, String comment) {
        // 1. Guard against duplicate submission
        List<FeedbackSubmission> existing = submissionRepository.findByStudentId(studentId);
        boolean alreadySubmitted = existing.stream().anyMatch(s -> s.getFormId().equals(formId));
        if (alreadySubmitted) {
            return Map.of("success", false, "error", "Duplicate submission rejected: Course feedback already submitted.");
        }

        // 2. Anonymity by design: Feedback responses do NOT contain a student ID.
        String answersJson = "{}";
        try {
            answersJson = objectMapper.writeValueAsString(answers != null ? answers : Map.of());
        } catch (JsonProcessingException ignored) {}

        String responseId = "fbr-" + System.currentTimeMillis() + "-" + UUID.randomUUID().toString().substring(0, 8);
        FeedbackResponse response = new FeedbackResponse(
                responseId,
                formId,
                answersJson,
                comment != null ? comment.trim() : null,
                Instant.now().toString()
        );
        responseRepository.save(response);

        // 3. Save receipt separately to prevent duplicate submission without linking to evaluation scores
        String submissionId = "sub-" + UUID.randomUUID();
        FeedbackSubmission submission = new FeedbackSubmission(
                submissionId,
                studentId,
                formId,
                Instant.now().toString()
        );
        submissionRepository.save(submission);

        return Map.of("success", true);
    }
}
