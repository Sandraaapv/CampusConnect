package com.campusconnect.model;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "past_semesters")
public class PastSemester {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "student_id", nullable = false, length = 64)
    private String studentId;

    @Column(name = "semester", nullable = false)
    private int semester;

    @Column(name = "term", nullable = false, length = 64)
    private String term;

    @Column(name = "sgpa", nullable = false)
    private double sgpa;

    @Column(name = "cumulative_cgpa", nullable = false)
    private double cumulativeCgpa;

    @Column(name = "total_credits", nullable = false)
    private int totalCredits;

    @OneToMany(mappedBy = "semesterId", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    private List<PastSubject> subjects = new ArrayList<>();

    public PastSemester() {}

    public PastSemester(String studentId, int semester, String term, double sgpa, double cumulativeCgpa, int totalCredits) {
        this.studentId = studentId;
        this.semester = semester;
        this.term = term;
        this.sgpa = sgpa;
        this.cumulativeCgpa = cumulativeCgpa;
        this.totalCredits = totalCredits;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getStudentId() { return studentId; }
    public void setStudentId(String studentId) { this.studentId = studentId; }

    public int getSemester() { return semester; }
    public void setSemester(int semester) { this.semester = semester; }

    public String getTerm() { return term; }
    public void setTerm(String term) { this.term = term; }

    public double getSgpa() { return sgpa; }
    public void setSgpa(double sgpa) { this.sgpa = sgpa; }

    public double getCumulativeCgpa() { return cumulativeCgpa; }
    public void setCumulativeCgpa(double cumulativeCgpa) { this.cumulativeCgpa = cumulativeCgpa; }

    public int getTotalCredits() { return totalCredits; }
    public void setTotalCredits(int totalCredits) { this.totalCredits = totalCredits; }

    public List<PastSubject> getSubjects() { return subjects; }
    public void setSubjects(List<PastSubject> subjects) { this.subjects = subjects; }
}
