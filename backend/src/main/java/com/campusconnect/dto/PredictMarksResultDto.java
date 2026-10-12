package com.campusconnect.dto;

import com.campusconnect.model.MarkRecord;
import com.campusconnect.model.Subject;

public class PredictMarksResultDto {
    private Subject subject;
    private MarkRecord mark;
    private double targetCgpa;
    private String targetGrade;
    private int neededMarksOutOf100;
    private boolean isImpossible;
    private double bestAchievableCgpa;
    private String bestAchievableGrade;

    public PredictMarksResultDto() {}

    public PredictMarksResultDto(Subject subject, MarkRecord mark, double targetCgpa, String targetGrade, int neededMarksOutOf100, boolean isImpossible, double bestAchievableCgpa, String bestAchievableGrade) {
        this.subject = subject;
        this.mark = mark;
        this.targetCgpa = targetCgpa;
        this.targetGrade = targetGrade;
        this.neededMarksOutOf100 = neededMarksOutOf100;
        this.isImpossible = isImpossible;
        this.bestAchievableCgpa = bestAchievableCgpa;
        this.bestAchievableGrade = bestAchievableGrade;
    }

    public Subject getSubject() { return subject; }
    public void setSubject(Subject subject) { this.subject = subject; }

    public MarkRecord getMark() { return mark; }
    public void setMark(MarkRecord mark) { this.mark = mark; }

    public double getTargetCgpa() { return targetCgpa; }
    public void setTargetCgpa(double targetCgpa) { this.targetCgpa = targetCgpa; }

    public String getTargetGrade() { return targetGrade; }
    public void setTargetGrade(String targetGrade) { this.targetGrade = targetGrade; }

    public int getNeededMarksOutOf100() { return neededMarksOutOf100; }
    public void setNeededMarksOutOf100(int neededMarksOutOf100) { this.neededMarksOutOf100 = neededMarksOutOf100; }

    public boolean getIsImpossible() { return isImpossible; }
    public void setIsImpossible(boolean isImpossible) { this.isImpossible = isImpossible; }

    public double getBestAchievableCgpa() { return bestAchievableCgpa; }
    public void setBestAchievableCgpa(double bestAchievableCgpa) { this.bestAchievableCgpa = bestAchievableCgpa; }

    public String getBestAchievableGrade() { return bestAchievableGrade; }
    public void setBestAchievableGrade(String bestAchievableGrade) { this.bestAchievableGrade = bestAchievableGrade; }
}
