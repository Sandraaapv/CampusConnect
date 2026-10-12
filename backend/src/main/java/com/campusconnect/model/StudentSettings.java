package com.campusconnect.model;

import jakarta.persistence.*;

@Entity
@Table(name = "student_settings")
public class StudentSettings {

    @Id
    @Column(name = "student_id", length = 64)
    private String studentId;

    @Column(name = "attendance_threshold", nullable = false)
    private int attendanceThreshold = 75;

    @Column(name = "target_cgpa", nullable = false)
    private double targetCgpa = 8.5;

    @Column(name = "daily_study_hours", nullable = false)
    private int dailyStudyHours = 4;

    @Column(name = "internal_weight", nullable = false)
    private int internalWeight = 50;

    @Column(name = "end_sem_weight", nullable = false)
    private int endSemWeight = 50;

    @Column(name = "email_alerts_json", columnDefinition = "TEXT")
    private String emailAlertsJson;

    @Column(name = "theme", nullable = false, length = 32)
    private String theme = "system";

    public StudentSettings() {}

    public StudentSettings(String studentId, int attendanceThreshold, double targetCgpa, int dailyStudyHours, int internalWeight, int endSemWeight, String emailAlertsJson, String theme) {
        this.studentId = studentId;
        this.attendanceThreshold = attendanceThreshold;
        this.targetCgpa = targetCgpa;
        this.dailyStudyHours = dailyStudyHours;
        this.internalWeight = internalWeight;
        this.endSemWeight = endSemWeight;
        this.emailAlertsJson = emailAlertsJson;
        this.theme = theme != null ? theme : "system";
    }

    public String getStudentId() { return studentId; }
    public void setStudentId(String studentId) { this.studentId = studentId; }

    public int getAttendanceThreshold() { return attendanceThreshold; }
    public void setAttendanceThreshold(int attendanceThreshold) { this.attendanceThreshold = attendanceThreshold; }

    public double getTargetCgpa() { return targetCgpa; }
    public void setTargetCgpa(double targetCgpa) { this.targetCgpa = targetCgpa; }

    public int getDailyStudyHours() { return dailyStudyHours; }
    public void setDailyStudyHours(int dailyStudyHours) { this.dailyStudyHours = dailyStudyHours; }

    public int getInternalWeight() { return internalWeight; }
    public void setInternalWeight(int internalWeight) { this.internalWeight = internalWeight; }

    public int getEndSemWeight() { return endSemWeight; }
    public void setEndSemWeight(int endSemWeight) { this.endSemWeight = endSemWeight; }

    public String getEmailAlertsJson() { return emailAlertsJson; }
    public void setEmailAlertsJson(String emailAlertsJson) { this.emailAlertsJson = emailAlertsJson; }

    public String getTheme() { return theme; }
    public void setTheme(String theme) { this.theme = theme; }
}
