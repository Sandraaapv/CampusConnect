package com.campusconnect.dto;

import java.util.List;

public class DayStudyPlanDto {
    private String dayName;
    private String date;
    private double allocatedHours;
    private List<StudyPlanTaskDto> tasks;

    public DayStudyPlanDto() {}

    public DayStudyPlanDto(String dayName, String date, double allocatedHours, List<StudyPlanTaskDto> tasks) {
        this.dayName = dayName;
        this.date = date;
        this.allocatedHours = allocatedHours;
        this.tasks = tasks;
    }

    public String getDayName() { return dayName; }
    public void setDayName(String dayName) { this.dayName = dayName; }

    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }

    public double getAllocatedHours() { return allocatedHours; }
    public void setAllocatedHours(double allocatedHours) { this.allocatedHours = allocatedHours; }

    public List<StudyPlanTaskDto> getTasks() { return tasks; }
    public void setTasks(List<StudyPlanTaskDto> tasks) { this.tasks = tasks; }
}
