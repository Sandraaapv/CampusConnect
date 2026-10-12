package com.campusconnect.model;

import jakarta.persistence.*;

@Entity
@Table(name = "helpdesk_tickets")
public class HelpdeskTicket {

    @Id
    @Column(name = "id", length = 64)
    private String id;

    @Column(name = "ticket_number", nullable = false, length = 32)
    private String ticketNumber;

    @Column(name = "student_id", nullable = false, length = 64)
    private String studentId;

    @Column(name = "category", nullable = false, length = 64)
    private String category;

    @Column(name = "priority", nullable = false, length = 32)
    private String priority;

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "description", nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(name = "location", nullable = false, length = 128)
    private String location;

    @Column(name = "status", nullable = false, length = 32)
    private String status = "Open"; // Open, Assigned, In progress, Resolved, Closed

    @Column(name = "assigned_department", nullable = false, length = 128)
    private String assignedDepartment;

    @Column(name = "rating")
    private Integer rating;

    @Column(name = "created_at", nullable = false, length = 64)
    private String createdAt;

    @Column(name = "updated_at", nullable = false, length = 64)
    private String updatedAt;

    public HelpdeskTicket() {}

    public HelpdeskTicket(String id, String ticketNumber, String studentId, String category, String priority, String title, String description, String location, String status, String assignedDepartment, Integer rating, String createdAt, String updatedAt) {
        this.id = id;
        this.ticketNumber = ticketNumber;
        this.studentId = studentId;
        this.category = category;
        this.priority = priority;
        this.title = title;
        this.description = description;
        this.location = location;
        this.status = status != null ? status : "Open";
        this.assignedDepartment = assignedDepartment;
        this.rating = rating;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getTicketNumber() { return ticketNumber; }
    public void setTicketNumber(String ticketNumber) { this.ticketNumber = ticketNumber; }

    public String getStudentId() { return studentId; }
    public void setStudentId(String studentId) { this.studentId = studentId; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getAssignedDepartment() { return assignedDepartment; }
    public void setAssignedDepartment(String assignedDepartment) { this.assignedDepartment = assignedDepartment; }

    public Integer getRating() { return rating; }
    public void setRating(Integer rating) { this.rating = rating; }

    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }

    public String getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(String updatedAt) { this.updatedAt = updatedAt; }
}
