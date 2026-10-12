package com.campusconnect.model;

import jakarta.persistence.*;

@Entity
@Table(name = "feedback_forms")
public class FeedbackForm {

    @Id
    @Column(name = "id", length = 64)
    private String id;

    @Column(name = "subject_id", nullable = false, length = 64)
    private String subjectId;

    @Column(name = "subject_code", nullable = false, length = 32)
    private String subjectCode;

    @Column(name = "subject_name", nullable = false, length = 128)
    private String subjectName;

    @Column(name = "faculty_id", nullable = false, length = 64)
    private String facultyId;

    @Column(name = "faculty_name", nullable = false, length = 128)
    private String facultyName;

    @Column(name = "opens_at", nullable = false, length = 32)
    private String opensAt;

    @Column(name = "closes_at", nullable = false, length = 32)
    private String closesAt;

    @Column(name = "status", nullable = false, length = 32)
    private String status = "pending";

    public FeedbackForm() {}

    public FeedbackForm(String id, String subjectId, String subjectCode, String subjectName, String facultyId, String facultyName, String opensAt, String closesAt, String status) {
        this.id = id;
        this.subjectId = subjectId;
        this.subjectCode = subjectCode;
        this.subjectName = subjectName;
        this.facultyId = facultyId;
        this.facultyName = facultyName;
        this.opensAt = opensAt;
        this.closesAt = closesAt;
        this.status = status != null ? status : "pending";
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getSubjectId() { return subjectId; }
    public void setSubjectId(String subjectId) { this.subjectId = subjectId; }

    public String getSubjectCode() { return subjectCode; }
    public void setSubjectCode(String subjectCode) { this.subjectCode = subjectCode; }

    public String getSubjectName() { return subjectName; }
    public void setSubjectName(String subjectName) { this.subjectName = subjectName; }

    public String getFacultyId() { return facultyId; }
    public void setFacultyId(String facultyId) { this.facultyId = facultyId; }

    public String getFacultyName() { return facultyName; }
    public void setFacultyName(String facultyName) { this.facultyName = facultyName; }

    public String getOpensAt() { return opensAt; }
    public void setOpensAt(String opensAt) { this.opensAt = opensAt; }

    public String getClosesAt() { return closesAt; }
    public void setClosesAt(String closesAt) { this.closesAt = closesAt; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
