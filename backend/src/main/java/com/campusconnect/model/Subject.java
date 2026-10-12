package com.campusconnect.model;

import jakarta.persistence.*;

@Entity
@Table(name = "subjects")
public class Subject {

    @Id
    @Column(name = "id", length = 64)
    private String id;

    @Column(name = "code", nullable = false, length = 32)
    private String code;

    @Column(name = "name", nullable = false, length = 128)
    private String name;

    @Column(name = "credits", nullable = false)
    private int credits;

    @Column(name = "faculty_name", nullable = false, length = 128)
    private String facultyName;

    @Column(name = "syllabus_coverage_percent", nullable = false)
    private int syllabusCoveragePercent = 75;

    public Subject() {}

    public Subject(String id, String code, String name, int credits, String facultyName, int syllabusCoveragePercent) {
        this.id = id;
        this.code = code;
        this.name = name;
        this.credits = credits;
        this.facultyName = facultyName;
        this.syllabusCoveragePercent = syllabusCoveragePercent;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public int getCredits() { return credits; }
    public void setCredits(int credits) { this.credits = credits; }

    public String getFacultyName() { return facultyName; }
    public void setFacultyName(String facultyName) { this.facultyName = facultyName; }

    public int getSyllabusCoveragePercent() { return syllabusCoveragePercent; }
    public void setSyllabusCoveragePercent(int syllabusCoveragePercent) { this.syllabusCoveragePercent = syllabusCoveragePercent; }
}
