package com.campusconnect.controller;

import com.campusconnect.model.FeedbackForm;
import com.campusconnect.model.FeedbackQuestion;
import com.campusconnect.model.User;
import com.campusconnect.service.FeedbackService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/feedback")
public class FeedbackController {

    private final FeedbackService feedbackService;

    public FeedbackController(FeedbackService feedbackService) {
        this.feedbackService = feedbackService;
    }

    private String getStudentId(Authentication authentication) {
        if (authentication == null) return null;
        Object principal = authentication.getPrincipal();
        if (principal instanceof User user) {
            return user.getId();
        }
        return principal != null ? principal.toString() : null;
    }

    @GetMapping("/forms")
    public ResponseEntity<List<FeedbackForm>> getFeedbackForms(Authentication authentication) {
        String studentId = getStudentId(authentication);
        return ResponseEntity.ok(feedbackService.getFormsForStudent(studentId));
    }

    @GetMapping("/questions")
    public ResponseEntity<List<FeedbackQuestion>> getFeedbackQuestions() {
        return ResponseEntity.ok(feedbackService.getQuestions());
    }

    public static class FeedbackSubmitRequest {
        public String formId;
        public Map<String, Integer> answers;
        public String comment;
    }

    @PostMapping("/submit")
    public ResponseEntity<Map<String, Object>> submitFeedback(
            Authentication authentication,
            @RequestBody FeedbackSubmitRequest req) {
        String studentId = getStudentId(authentication);
        Map<String, Object> result = feedbackService.submitFeedback(studentId, req.formId, req.answers, req.comment);
        return ResponseEntity.ok(result);
    }
}
