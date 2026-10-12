package com.campusconnect.model;

import jakarta.persistence.*;

@Entity
@Table(name = "past_subjects")
public class PastSubject {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "semester_id", nullable = false)
    private Long semesterId;

    @Column(name = "code", nullable = false, length = 32)
    private String code;

    @Column(name = "name", nullable = false, length = 128)
    private String name;

    @Column(name = "credits", nullable = false)
    private int credits;

    @Column(name = "grade", nullable = false, length = 16)
    private String grade;

    @Column(name = "grade_points", nullable = false)
    private int gradePoints;

    @Column(name = "is_arrear", nullable = false)
    private boolean arrear = false;

    public PastSubject() {}

    public PastSubject(Long semesterId, String code, String name, int credits, String grade, int gradePoints, boolean arrear) {
        this.semesterId = semesterId;
        this.code = code;
        this.name = name;
        this.credits = credits;
        this.grade = grade;
        this.gradePoints = gradePoints;
        this.arrear = arrear;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getSemesterId() { return semesterId; }
    public void setSemesterId(Long semesterId) { this.semesterId = semesterId; }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public int getCredits() { return credits; }
    public void setCredits(int credits) { this.credits = credits; }

    public String getGrade() { return grade; }
    public void setGrade(String grade) { this.grade = grade; }

    public int getGradePoints() { return gradePoints; }
    public void setGradePoints(int gradePoints) { this.gradePoints = gradePoints; }

    public boolean isArrear() { return arrear; }
    public void setArrear(boolean arrear) { this.arrear = arrear; }
}
