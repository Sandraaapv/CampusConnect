package com.campusconnect.model;

import jakarta.persistence.*;

@Entity
@Table(name = "timetable_entries")
public class TimetableEntry {

    @Id
    @Column(name = "id", length = 64)
    private String id;

    @Column(name = "student_id", nullable = false, length = 64)
    private String studentId;

    @Column(name = "day_of_week", nullable = false, length = 16)
    private String dayOfWeek;

    @Column(name = "subject_id", nullable = false, length = 64)
    private String subjectId;

    @Column(name = "subject_code", nullable = false, length = 32)
    private String subjectCode;

    @Column(name = "subject_name", nullable = false, length = 128)
    private String subjectName;

    @Column(name = "start_time", nullable = false, length = 16)
    private String startTime;

    @Column(name = "end_time", nullable = false, length = 16)
    private String endTime;

    @Column(name = "room", nullable = false, length = 64)
    private String room;

    public TimetableEntry() {}

    public TimetableEntry(String id, String studentId, String dayOfWeek, String subjectId, String subjectCode, String subjectName, String startTime, String endTime, String room) {
        this.id = id;
        this.studentId = studentId;
        this.dayOfWeek = dayOfWeek;
        this.subjectId = subjectId;
        this.subjectCode = subjectCode;
        this.subjectName = subjectName;
        this.startTime = startTime;
        this.endTime = endTime;
        this.room = room;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getStudentId() { return studentId; }
    public void setStudentId(String studentId) { this.studentId = studentId; }

    public String getDayOfWeek() { return dayOfWeek; }
    public void setDayOfWeek(String dayOfWeek) { this.dayOfWeek = dayOfWeek; }

    public String getSubjectId() { return subjectId; }
    public void setSubjectId(String subjectId) { this.subjectId = subjectId; }

    public String getSubjectCode() { return subjectCode; }
    public void setSubjectCode(String subjectCode) { this.subjectCode = subjectCode; }

    public String getSubjectName() { return subjectName; }
    public void setSubjectName(String subjectName) { this.subjectName = subjectName; }

    public String getStartTime() { return startTime; }
    public void setStartTime(String startTime) { this.startTime = startTime; }

    public String getEndTime() { return endTime; }
    public void setEndTime(String endTime) { this.endTime = endTime; }

    public String getRoom() { return room; }
    public void setRoom(String room) { this.room = room; }
}
