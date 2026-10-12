package com.campusconnect.model;

import jakarta.persistence.*;

/**
 * Anonymity by design: Feedback responses do NOT contain a student ID.
 * Submission receipts are tracked separately in feedback_submissions to prevent duplicate entries
 * without ever linking student identity to their evaluation scores or comments.
 */
@Entity
@Table(name = "feedback_responses")
public class FeedbackResponse {

    @Id
    @Column(name = "id", length = 64)
    private String id;

    @Column(name = "form_id", nullable = false, length = 64)
    private String formId;

    @Column(name = "answers_json", columnDefinition = "TEXT")
    private String answersJson; // JSON mapping questionId -> rating 1..5

    @Column(name = "comment", columnDefinition = "TEXT")
    private String comment;

    @Column(name = "created_at", nullable = false, length = 64)
    private String createdAt;

    public FeedbackResponse() {}

    public FeedbackResponse(String id, String formId, String answersJson, String comment, String createdAt) {
        this.id = id;
        this.formId = formId;
        this.answersJson = answersJson;
        this.comment = comment;
        this.createdAt = createdAt;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getFormId() { return formId; }
    public void setFormId(String formId) { this.formId = formId; }

    public String getAnswersJson() { return answersJson; }
    public void setAnswersJson(String answersJson) { this.answersJson = answersJson; }

    public String getComment() { return comment; }
    public void setComment(String comment) { this.comment = comment; }

    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
}
