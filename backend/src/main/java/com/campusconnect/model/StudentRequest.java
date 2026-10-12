package com.campusconnect.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "student_requests")
public class StudentRequest {

    @Id
    @Column(name = "id", length = 64)
    private String id;

    @Column(name = "student_id", nullable = false, length = 64)
    private String studentId;

    @Column(name = "type", nullable = false, length = 64)
    private String type; // No-dues, OD letter, Scholarship, Event, Attendance correction

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "status", nullable = false, length = 32)
    private String status = "Submitted"; // Submitted, In Review, Faculty Review, Admin Review, Approved, Rejected

    @Column(name = "submitted_date", nullable = false, length = 16)
    private String submittedDate; // YYYY-MM-DD

    @Column(name = "details_json", columnDefinition = "TEXT")
    private String detailsJson;

    @Column(name = "verification_token", nullable = false, length = 128)
    private String verificationToken;

    @Column(name = "od_days_credited", nullable = false)
    private int odDaysCredited = 0;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public StudentRequest() {}

    public StudentRequest(String id, String studentId, String type, String title, String status, String submittedDate, String detailsJson, String verificationToken, int odDaysCredited) {
        this.id = id;
        this.studentId = studentId;
        this.type = type;
        this.title = title;
        this.status = status;
        this.submittedDate = submittedDate;
        this.detailsJson = detailsJson;
        this.verificationToken = verificationToken;
        this.odDaysCredited = odDaysCredited;
        this.createdAt = LocalDateTime.now();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getStudentId() { return studentId; }
    public void setStudentId(String studentId) { this.studentId = studentId; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getSubmittedDate() { return submittedDate; }
    public void setSubmittedDate(String submittedDate) { this.submittedDate = submittedDate; }

    public String getDetailsJson() { return detailsJson; }
    public void setDetailsJson(String detailsJson) { this.detailsJson = detailsJson; }

    public String getVerificationToken() { return verificationToken; }
    public void setVerificationToken(String verificationToken) { this.verificationToken = verificationToken; }

    public int getOdDaysCredited() { return odDaysCredited; }
    public void setOdDaysCredited(int odDaysCredited) { this.odDaysCredited = odDaysCredited; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
