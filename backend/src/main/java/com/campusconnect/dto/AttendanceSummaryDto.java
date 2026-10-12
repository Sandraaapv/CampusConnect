package com.campusconnect.dto;

import com.campusconnect.model.Subject;

public class AttendanceSummaryDto {
    private Subject subject;
    private int total;
    private int attended;
    private double currentPercent;
    private int safeSkips;
    private int classesNeeded;
    private boolean isAtRisk;
    private boolean isEligible;
    private String attendanceCode; // "H", "9", "8", "L"

    public AttendanceSummaryDto() {}

    public AttendanceSummaryDto(Subject subject, int total, int attended, double currentPercent, int safeSkips, int classesNeeded, boolean isAtRisk, boolean isEligible, String attendanceCode) {
        this.subject = subject;
        this.total = total;
        this.attended = attended;
        this.currentPercent = currentPercent;
        this.safeSkips = safeSkips;
        this.classesNeeded = classesNeeded;
        this.isAtRisk = isAtRisk;
        this.isEligible = isEligible;
        this.attendanceCode = attendanceCode;
    }

    public Subject getSubject() { return subject; }
    public void setSubject(Subject subject) { this.subject = subject; }

    public int getTotal() { return total; }
    public void setTotal(int total) { this.total = total; }

    public int getAttended() { return attended; }
    public void setAttended(int attended) { this.attended = attended; }

    public double getCurrentPercent() { return currentPercent; }
    public void setCurrentPercent(double currentPercent) { this.currentPercent = currentPercent; }

    public int getSafeSkips() { return safeSkips; }
    public void setSafeSkips(int safeSkips) { this.safeSkips = safeSkips; }

    public int getClassesNeeded() { return classesNeeded; }
    public void setClassesNeeded(int classesNeeded) { this.classesNeeded = classesNeeded; }

    public boolean getIsAtRisk() { return isAtRisk; }
    public void setIsAtRisk(boolean isAtRisk) { this.isAtRisk = isAtRisk; }

    public boolean getIsEligible() { return isEligible; }
    public void setIsEligible(boolean isEligible) { this.isEligible = isEligible; }

    public String getAttendanceCode() { return attendanceCode; }
    public void setAttendanceCode(String attendanceCode) { this.attendanceCode = attendanceCode; }
}
