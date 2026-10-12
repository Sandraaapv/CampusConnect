package com.campusconnect.model;

import jakarta.persistence.*;

@Entity
@Table(name = "feedback_submissions", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"student_id", "form_id"})
})
public class FeedbackSubmission {

    @Id
    @Column(name = "id", length = 64)
    private String id;

    @Column(name = "student_id", nullable = false, length = 64)
    private String studentId;

    @Column(name = "form_id", nullable = false, length = 64)
    private String formId;

    @Column(name = "submitted_at", nullable = false, length = 64)
    private String submittedAt;

    public FeedbackSubmission() {}

    public FeedbackSubmission(String id, String studentId, String formId, String submittedAt) {
        this.id = id;
        this.studentId = studentId;
        this.formId = formId;
        this.submittedAt = submittedAt;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getStudentId() { return studentId; }
    public void setStudentId(String studentId) { this.studentId = studentId; }

    public String getFormId() { return formId; }
    public void setFormId(String formId) { this.formId = formId; }

    public String getSubmittedAt() { return submittedAt; }
    public void setSubmittedAt(String submittedAt) { this.submittedAt = submittedAt; }
}
