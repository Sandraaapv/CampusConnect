package com.campusconnect.dto;

public class StudyPlanTaskDto {
    private String subjectId;
    private String subjectCode;
    private String subjectName;
    private String unitId;
    private int unitNo;
    private String unitTitle;
    private double hours;
    private boolean isRevision;

    public StudyPlanTaskDto() {}

    public StudyPlanTaskDto(String subjectId, String subjectCode, String subjectName,
                            String unitId, int unitNo, String unitTitle, double hours, boolean isRevision) {
        this.subjectId = subjectId;
        this.subjectCode = subjectCode;
        this.subjectName = subjectName;
        this.unitId = unitId;
        this.unitNo = unitNo;
        this.unitTitle = unitTitle;
        this.hours = hours;
        this.isRevision = isRevision;
    }

    public String getSubjectId() { return subjectId; }
    public void setSubjectId(String subjectId) { this.subjectId = subjectId; }

    public String getSubjectCode() { return subjectCode; }
    public void setSubjectCode(String subjectCode) { this.subjectCode = subjectCode; }

    public String getSubjectName() { return subjectName; }
    public void setSubjectName(String subjectName) { this.subjectName = subjectName; }

    public String getUnitId() { return unitId; }
    public void setUnitId(String unitId) { this.unitId = unitId; }

    public int getUnitNo() { return unitNo; }
    public void setUnitNo(int unitNo) { this.unitNo = unitNo; }

    public String getUnitTitle() { return unitTitle; }
    public void setUnitTitle(String unitTitle) { this.unitTitle = unitTitle; }

    public double getHours() { return hours; }
    public void setHours(double hours) { this.hours = hours; }

    public boolean isRevision() { return isRevision; }
    public void setRevision(boolean revision) { isRevision = revision; }
}
