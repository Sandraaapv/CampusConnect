package com.campusconnect.dto;

import java.util.List;
import java.util.Map;

public class StudyPlanResultDto {
    private int dailyHoursCap;
    private double totalScheduledHours;
    private int remainingUnitsCount;
    private List<Map<String, Object>> atRiskSubjects;
    private List<DayStudyPlanDto> days;

    public StudyPlanResultDto() {}

    public StudyPlanResultDto(int dailyHoursCap, double totalScheduledHours, int remainingUnitsCount,
                              List<Map<String, Object>> atRiskSubjects, List<DayStudyPlanDto> days) {
        this.dailyHoursCap = dailyHoursCap;
        this.totalScheduledHours = totalScheduledHours;
        this.remainingUnitsCount = remainingUnitsCount;
        this.atRiskSubjects = atRiskSubjects;
        this.days = days;
    }

    public int getDailyHoursCap() { return dailyHoursCap; }
    public void setDailyHoursCap(int dailyHoursCap) { this.dailyHoursCap = dailyHoursCap; }

    public double getTotalScheduledHours() { return totalScheduledHours; }
    public void setTotalScheduledHours(double totalScheduledHours) { this.totalScheduledHours = totalScheduledHours; }

    public int getRemainingUnitsCount() { return remainingUnitsCount; }
    public void setRemainingUnitsCount(int remainingUnitsCount) { this.remainingUnitsCount = remainingUnitsCount; }

    public List<Map<String, Object>> getAtRiskSubjects() { return atRiskSubjects; }
    public void setAtRiskSubjects(List<Map<String, Object>> atRiskSubjects) { this.atRiskSubjects = atRiskSubjects; }

    public List<DayStudyPlanDto> getDays() { return days; }
    public void setDays(List<DayStudyPlanDto> days) { this.days = days; }
}
