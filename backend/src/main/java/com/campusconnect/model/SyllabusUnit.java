package com.campusconnect.model;

import jakarta.persistence.*;

@Entity
@Table(name = "syllabus_units")
public class SyllabusUnit {

    @Id
    @Column(name = "id", length = 64)
    private String id;

    @Column(name = "subject_id", nullable = false, length = 64)
    private String subjectId;

    @Column(name = "unit_no", nullable = false)
    private int unitNo;

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "est_hours", nullable = false)
    private int estHours;

    public SyllabusUnit() {}

    public SyllabusUnit(String id, String subjectId, int unitNo, String title, int estHours) {
        this.id = id;
        this.subjectId = subjectId;
        this.unitNo = unitNo;
        this.title = title;
        this.estHours = estHours;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getSubjectId() { return subjectId; }
    public void setSubjectId(String subjectId) { this.subjectId = subjectId; }

    public int getUnitNo() { return unitNo; }
    public void setUnitNo(int unitNo) { this.unitNo = unitNo; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public int getEstHours() { return estHours; }
    public void setEstHours(int estHours) { this.estHours = estHours; }
}
