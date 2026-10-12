package com.campusconnect.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "student_unit_progress", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"student_id", "unit_id"})
})
public class StudentUnitProgress {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "student_id", nullable = false, length = 64)
    private String studentId;

    @Column(name = "unit_id", nullable = false, length = 64)
    private String unitId;

    @Column(name = "covered", nullable = false)
    private boolean covered = false;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();

    public StudentUnitProgress() {}

    public StudentUnitProgress(String studentId, String unitId, boolean covered) {
        this.studentId = studentId;
        this.unitId = unitId;
        this.covered = covered;
        this.updatedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getStudentId() { return studentId; }
    public void setStudentId(String studentId) { this.studentId = studentId; }

    public String getUnitId() { return unitId; }
    public void setUnitId(String unitId) { this.unitId = unitId; }

    public boolean isCovered() { return covered; }
    public void setCovered(boolean covered) {
        this.covered = covered;
        this.updatedAt = LocalDateTime.now();
    }

    public boolean isCompleted() { return covered; }
    public void setCompleted(boolean completed) {
        this.covered = completed;
        this.updatedAt = LocalDateTime.now();
    }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
