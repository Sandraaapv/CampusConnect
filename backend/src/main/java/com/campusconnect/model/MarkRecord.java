package com.campusconnect.model;

import jakarta.persistence.*;

@Entity
@Table(name = "mark_records")
public class MarkRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "student_id", nullable = false, length = 64)
    private String studentId;

    @Column(name = "subject_id", nullable = false, length = 64)
    private String subjectId;

    @Column(name = "internal1", nullable = false)
    private double internal1;

    @Column(name = "internal2", nullable = false)
    private double internal2;

    @Column(name = "assignment", nullable = false)
    private double assignment;

    @Column(name = "total_internal", nullable = false)
    private double totalInternal;

    @Column(name = "max_internal", nullable = false)
    private int maxInternal = 50;

    @Column(name = "credits", nullable = false)
    private int credits;

    @Column(name = "source", nullable = false, length = 32)
    private String source = "college";

    public MarkRecord() {}

    public MarkRecord(String studentId, String subjectId, double internal1, double internal2, double assignment, double totalInternal, int maxInternal, int credits, String source) {
        this.studentId = studentId;
        this.subjectId = subjectId;
        this.internal1 = internal1;
        this.internal2 = internal2;
        this.assignment = assignment;
        this.totalInternal = totalInternal;
        this.maxInternal = maxInternal;
        this.credits = credits;
        this.source = source != null ? source : "college";
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getStudentId() { return studentId; }
    public void setStudentId(String studentId) { this.studentId = studentId; }

    public String getSubjectId() { return subjectId; }
    public void setSubjectId(String subjectId) { this.subjectId = subjectId; }

    public double getInternal1() { return internal1; }
    public void setInternal1(double internal1) { this.internal1 = internal1; }

    public double getInternal2() { return internal2; }
    public void setInternal2(double internal2) { this.internal2 = internal2; }

    public double getAssignment() { return assignment; }
    public void setAssignment(double assignment) { this.assignment = assignment; }

    public double getTotalInternal() { return totalInternal; }
    public void setTotalInternal(double totalInternal) { this.totalInternal = totalInternal; }

    public int getMaxInternal() { return maxInternal; }
    public void setMaxInternal(int maxInternal) { this.maxInternal = maxInternal; }

    public int getCredits() { return credits; }
    public void setCredits(int credits) { this.credits = credits; }

    public String getSource() { return source; }
    public void setSource(String source) { this.source = source; }
}
