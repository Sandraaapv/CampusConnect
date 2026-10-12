package com.campusconnect.dto;

import java.util.List;
import java.util.Map;

public class RequestItemDto {
    private String id;
    private String type;
    private String title;
    private String status;
    private String submittedDate;
    private Map<String, Object> details;
    private List<DepartmentClearanceDto> departmentStages;
    private Integer odDaysCredited;
    private List<RequestCommentDto> comments;
    private String verificationToken;

    public static class DepartmentClearanceDto {
        private String department;
        private boolean cleared;
        private String clearedAt;
        private String remarks;

        public DepartmentClearanceDto() {}

        public DepartmentClearanceDto(String department, boolean cleared, String clearedAt, String remarks) {
            this.department = department;
            this.cleared = cleared;
            this.clearedAt = clearedAt;
            this.remarks = remarks;
        }

        public String getDepartment() { return department; }
        public void setDepartment(String department) { this.department = department; }

        public boolean isCleared() { return cleared; }
        public void setCleared(boolean cleared) { this.cleared = cleared; }

        public String getClearedAt() { return clearedAt; }
        public void setClearedAt(String clearedAt) { this.clearedAt = clearedAt; }

        public String getRemarks() { return remarks; }
        public void setRemarks(String remarks) { this.remarks = remarks; }
    }

    public static class RequestCommentDto {
        private String role;
        private String author;
        private String comment;
        private String date;

        public RequestCommentDto() {}

        public RequestCommentDto(String role, String author, String comment, String date) {
            this.role = role;
            this.author = author;
            this.comment = comment;
            this.date = date;
        }

        public String getRole() { return role; }
        public void setRole(String role) { this.role = role; }

        public String getAuthor() { return author; }
        public void setAuthor(String author) { this.author = author; }

        public String getComment() { return comment; }
        public void setComment(String comment) { this.comment = comment; }

        public String getDate() { return date; }
        public void setDate(String date) { this.date = date; }
    }

    public RequestItemDto() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getSubmittedDate() { return submittedDate; }
    public void setSubmittedDate(String submittedDate) { this.submittedDate = submittedDate; }

    public Map<String, Object> getDetails() { return details; }
    public void setDetails(Map<String, Object> details) { this.details = details; }

    public List<DepartmentClearanceDto> getDepartmentStages() { return departmentStages; }
    public void setDepartmentStages(List<DepartmentClearanceDto> departmentStages) { this.departmentStages = departmentStages; }

    public Integer getOdDaysCredited() { return odDaysCredited; }
    public void setOdDaysCredited(Integer odDaysCredited) { this.odDaysCredited = odDaysCredited; }

    public List<RequestCommentDto> getComments() { return comments; }
    public void setComments(List<RequestCommentDto> comments) { this.comments = comments; }

    public String getVerificationToken() { return verificationToken; }
    public void setVerificationToken(String verificationToken) { this.verificationToken = verificationToken; }
}
