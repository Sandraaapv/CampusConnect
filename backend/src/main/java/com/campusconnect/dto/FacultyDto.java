package com.campusconnect.dto;

import java.util.List;

public class FacultyDto {
    private String id;
    private String name;
    private String designation;
    private String department;
    private String email;
    private String cabin;
    private List<String> specializations;
    private String bio;
    private List<SubjectRef> subjects;
    private List<OfficeHourRef> officeHours;

    public FacultyDto() {}

    public FacultyDto(String id, String name, String designation, String department, String email, String cabin, List<String> specializations, String bio, List<SubjectRef> subjects, List<OfficeHourRef> officeHours) {
        this.id = id;
        this.name = name;
        this.designation = designation;
        this.department = department;
        this.email = email;
        this.cabin = cabin;
        this.specializations = specializations;
        this.bio = bio;
        this.subjects = subjects;
        this.officeHours = officeHours;
    }

    public static class SubjectRef {
        private String id;
        private String code;
        private String name;

        public SubjectRef() {}
        public SubjectRef(String id, String code, String name) {
            this.id = id;
            this.code = code;
            this.name = name;
        }

        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getCode() { return code; }
        public void setCode(String code) { this.code = code; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
    }

    public static class OfficeHourRef {
        private String day;
        private String startTime;
        private String endTime;

        public OfficeHourRef() {}
        public OfficeHourRef(String day, String startTime, String endTime) {
            this.day = day;
            this.startTime = startTime;
            this.endTime = endTime;
        }

        public String getDay() { return day; }
        public void setDay(String day) { this.day = day; }
        public String getStartTime() { return startTime; }
        public void setStartTime(String startTime) { this.startTime = startTime; }
        public String getEndTime() { return endTime; }
        public void setEndTime(String endTime) { this.endTime = endTime; }
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDesignation() { return designation; }
    public void setDesignation(String designation) { this.designation = designation; }
    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getCabin() { return cabin; }
    public void setCabin(String cabin) { this.cabin = cabin; }
    public List<String> getSpecializations() { return specializations; }
    public void setSpecializations(List<String> specializations) { this.specializations = specializations; }
    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }
    public List<SubjectRef> getSubjects() { return subjects; }
    public void setSubjects(List<SubjectRef> subjects) { this.subjects = subjects; }
    public List<OfficeHourRef> getOfficeHours() { return officeHours; }
    public void setOfficeHours(List<OfficeHourRef> officeHours) { this.officeHours = officeHours; }
}
