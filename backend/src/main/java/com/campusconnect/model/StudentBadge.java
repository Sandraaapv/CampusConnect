package com.campusconnect.model;

import jakarta.persistence.*;

@Entity
@Table(name = "student_badges", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"student_id", "badge_id"})
})
public class StudentBadge {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "student_id", nullable = false, length = 64)
    private String studentId;

    @Column(name = "badge_id", nullable = false, length = 64)
    private String badgeId;

    @Column(name = "unlocked", nullable = false)
    private boolean unlocked = true;

    @Column(name = "unlocked_at", length = 32)
    private String unlockedAt;

    public StudentBadge() {}

    public StudentBadge(String studentId, String badgeId, boolean unlocked, String unlockedAt) {
        this.studentId = studentId;
        this.badgeId = badgeId;
        this.unlocked = unlocked;
        this.unlockedAt = unlockedAt;
    }

    public StudentBadge(String studentId, String badgeId, String unlockedAt) {
        this.studentId = studentId;
        this.badgeId = badgeId;
        this.unlocked = true;
        this.unlockedAt = unlockedAt;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getStudentId() { return studentId; }
    public void setStudentId(String studentId) { this.studentId = studentId; }

    public String getBadgeId() { return badgeId; }
    public void setBadgeId(String badgeId) { this.badgeId = badgeId; }

    public boolean isUnlocked() { return unlocked; }
    public void setUnlocked(boolean unlocked) { this.unlocked = unlocked; }

    public String getUnlockedAt() { return unlockedAt; }
    public void setUnlockedAt(String unlockedAt) { this.unlockedAt = unlockedAt; }
}
