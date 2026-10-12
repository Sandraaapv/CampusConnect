package com.campusconnect.model;

import jakarta.persistence.*;

@Entity
@Table(name = "timetable_slots")
public class TimetableSlot {

    @Id
    @Column(name = "id", length = 64)
    private String id;

    @Column(name = "day_of_week", nullable = false, length = 16)
    private String day; // DayOfWeek

    @Column(name = "period", nullable = false)
    private int period;

    @Column(name = "start_time", nullable = false, length = 16)
    private String startTime;

    @Column(name = "end_time", nullable = false, length = 16)
    private String endTime;

    @Column(name = "subject_id", nullable = false, length = 64)
    private String subjectId;

    @Column(name = "subject_code", nullable = false, length = 32)
    private String subjectCode;

    @Column(name = "subject_name", nullable = false, length = 128)
    private String subjectName;

    @Column(name = "room", nullable = false, length = 64)
    private String room;

    @Column(name = "faculty_id", length = 64)
    private String facultyId;

    @Column(name = "faculty_name", length = 128)
    private String facultyName;

    @Column(name = "slot_type", nullable = false, length = 32)
    private String slotType = "lecture";

    @Column(name = "color_key", length = 32)
    private String colorKey;

    public TimetableSlot() {}

    public TimetableSlot(String id, String day, int period, String startTime, String endTime, String subjectId, String subjectCode, String subjectName, String room, String facultyId, String facultyName, String slotType, String colorKey) {
        this.id = id;
        this.day = day;
        this.period = period;
        this.startTime = startTime;
        this.endTime = endTime;
        this.subjectId = subjectId;
        this.subjectCode = subjectCode;
        this.subjectName = subjectName;
        this.room = room;
        this.facultyId = facultyId;
        this.facultyName = facultyName;
        this.slotType = slotType != null ? slotType : "lecture";
        this.colorKey = colorKey;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getDay() { return day; }
    public void setDay(String day) { this.day = day; }

    public int getPeriod() { return period; }
    public void setPeriod(int period) { this.period = period; }

    public String getStartTime() { return startTime; }
    public void setStartTime(String startTime) { this.startTime = startTime; }

    public String getEndTime() { return endTime; }
    public void setEndTime(String endTime) { this.endTime = endTime; }

    public String getSubjectId() { return subjectId; }
    public void setSubjectId(String subjectId) { this.subjectId = subjectId; }

    public String getSubjectCode() { return subjectCode; }
    public void setSubjectCode(String subjectCode) { this.subjectCode = subjectCode; }

    public String getSubjectName() { return subjectName; }
    public void setSubjectName(String subjectName) { this.subjectName = subjectName; }

    public String getRoom() { return room; }
    public void setRoom(String room) { this.room = room; }

    public String getFacultyId() { return facultyId; }
    public void setFacultyId(String facultyId) { this.facultyId = facultyId; }

    public String getFacultyName() { return facultyName; }
    public void setFacultyName(String facultyName) { this.facultyName = facultyName; }

    public String getSlotType() { return slotType; }
    public void setSlotType(String slotType) { this.slotType = slotType; }

    public String getColorKey() { return colorKey; }
    public void setColorKey(String colorKey) { this.colorKey = colorKey; }
}
