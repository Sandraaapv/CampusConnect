package com.campusconnect.model;

import jakarta.persistence.*;

@Entity
@Table(name = "exams")
public class Exam {

    @Id
    @Column(name = "id", length = 64)
    private String id;

    @Column(name = "student_id", nullable = false, length = 64)
    private String studentId;

    @Column(name = "subject_id", nullable = false, length = 64)
    private String subjectId;

    @Column(name = "subject_code", nullable = false, length = 32)
    private String subjectCode;

    @Column(name = "subject_name", nullable = false, length = 128)
    private String subjectName;

    @Column(name = "exam_date", nullable = false, length = 16)
    private String examDate; // YYYY-MM-DD

    @Column(name = "start_time", nullable = false, length = 32)
    private String startTime;

    @Column(name = "duration", nullable = false, length = 32)
    private String duration;

    @Column(name = "room", nullable = false, length = 64)
    private String room;

    public Exam() {}

    public Exam(String id, String studentId, String subjectId, String subjectCode, String subjectName, String examDate, String startTime, String duration, String room) {
        this.id = id;
        this.studentId = studentId;
        this.subjectId = subjectId;
        this.subjectCode = subjectCode;
        this.subjectName = subjectName;
        this.examDate = examDate;
        this.startTime = startTime;
        this.duration = duration;
        this.room = room;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getStudentId() { return studentId; }
    public void setStudentId(String studentId) { this.studentId = studentId; }

    public String getSubjectId() { return subjectId; }
    public void setSubjectId(String subjectId) { this.subjectId = subjectId; }

    public String getSubjectCode() { return subjectCode; }
    public void setSubjectCode(String subjectCode) { this.subjectCode = subjectCode; }

    public String getSubjectName() { return subjectName; }
    public void setSubjectName(String subjectName) { this.subjectName = subjectName; }

    public String getExamDate() { return examDate; }
    public void setExamDate(String examDate) { this.examDate = examDate; }

    public String getStartTime() { return startTime; }
    public void setStartTime(String startTime) { this.startTime = startTime; }

    public String getDuration() { return duration; }
    public void setDuration(String duration) { this.duration = duration; }

    public String getRoom() { return room; }
    public void setRoom(String room) { this.room = room; }
}
