package com.campusconnect.model;

import jakarta.persistence.*;

@Entity
@Table(name = "faculty_office_hours")
public class FacultyOfficeHour {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "faculty_id", nullable = false, length = 64)
    private String facultyId;

    @Column(name = "day_of_week", nullable = false, length = 16)
    private String day;

    @Column(name = "start_time", nullable = false, length = 16)
    private String startTime;

    @Column(name = "end_time", nullable = false, length = 16)
    private String endTime;

    public FacultyOfficeHour() {}

    public FacultyOfficeHour(String facultyId, String day, String startTime, String endTime) {
        this.facultyId = facultyId;
        this.day = day;
        this.startTime = startTime;
        this.endTime = endTime;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getFacultyId() { return facultyId; }
    public void setFacultyId(String facultyId) { this.facultyId = facultyId; }

    public String getDay() { return day; }
    public void setDay(String day) { this.day = day; }

    public String getStartTime() { return startTime; }
    public void setStartTime(String startTime) { this.startTime = startTime; }

    public String getEndTime() { return endTime; }
    public void setEndTime(String endTime) { this.endTime = endTime; }
}
