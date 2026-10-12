package com.campusconnect.dto;

public class PredictMarksRequest {
    private Double targetCgpa;

    public PredictMarksRequest() {}

    public PredictMarksRequest(Double targetCgpa) {
        this.targetCgpa = targetCgpa;
    }

    public Double getTargetCgpa() { return targetCgpa; }
    public void setTargetCgpa(Double targetCgpa) { this.targetCgpa = targetCgpa; }
}
