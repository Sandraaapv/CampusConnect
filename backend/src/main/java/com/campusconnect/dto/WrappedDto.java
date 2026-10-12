package com.campusconnect.dto;

public class WrappedDto {
    private String studentName;
    private String department;
    private int semester;
    private String bestSubject;
    private String longestStreak;
    private String mostImprovedSubject;
    private int totalClassesAttended;
    private int totalClassesHeld;
    private String overallPercent;
    private int badgesEarnedCount;

    public WrappedDto() {}

    public WrappedDto(String studentName, String department, int semester, String bestSubject,
                      String longestStreak, String mostImprovedSubject, int totalClassesAttended,
                      int totalClassesHeld, String overallPercent, int badgesEarnedCount) {
        this.studentName = studentName;
        this.department = department;
        this.semester = semester;
        this.bestSubject = bestSubject;
        this.longestStreak = longestStreak;
        this.mostImprovedSubject = mostImprovedSubject;
        this.totalClassesAttended = totalClassesAttended;
        this.totalClassesHeld = totalClassesHeld;
        this.overallPercent = overallPercent;
        this.badgesEarnedCount = badgesEarnedCount;
    }

    public String getStudentName() { return studentName; }
    public void setStudentName(String studentName) { this.studentName = studentName; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public int getSemester() { return semester; }
    public void setSemester(int semester) { this.semester = semester; }

    public String getBestSubject() { return bestSubject; }
    public void setBestSubject(String bestSubject) { this.bestSubject = bestSubject; }

    public String getLongestStreak() { return longestStreak; }
    public void setLongestStreak(String longestStreak) { this.longestStreak = longestStreak; }

    public String getMostImprovedSubject() { return mostImprovedSubject; }
    public void setMostImprovedSubject(String mostImprovedSubject) { this.mostImprovedSubject = mostImprovedSubject; }

    public int getTotalClassesAttended() { return totalClassesAttended; }
    public void setTotalClassesAttended(int totalClassesAttended) { this.totalClassesAttended = totalClassesAttended; }

    public int getTotalClassesHeld() { return totalClassesHeld; }
    public void setTotalClassesHeld(int totalClassesHeld) { this.totalClassesHeld = totalClassesHeld; }

    public String getOverallPercent() { return overallPercent; }
    public void setOverallPercent(String overallPercent) { this.overallPercent = overallPercent; }

    public int getBadgesEarnedCount() { return badgesEarnedCount; }
    public void setBadgesEarnedCount(int badgesEarnedCount) { this.badgesEarnedCount = badgesEarnedCount; }
}
