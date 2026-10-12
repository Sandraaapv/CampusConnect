package com.campusconnect.model;

import jakarta.persistence.*;

@Entity
@Table(name = "request_comments")
public class RequestComment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "request_id", nullable = false, length = 64)
    private String requestId;

    @Column(name = "author_role", nullable = false, length = 64)
    private String role; // Student, Faculty, Admin, System

    @Column(name = "author", nullable = false, length = 128)
    private String author;

    @Column(name = "comment", nullable = false, columnDefinition = "TEXT")
    private String comment;

    @Column(name = "log_date", nullable = false, length = 32)
    private String date; // YYYY-MM-DD

    public RequestComment() {}

    public RequestComment(String requestId, String role, String author, String comment, String date) {
        this.requestId = requestId;
        this.role = role;
        this.author = author;
        this.comment = comment;
        this.date = date;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getRequestId() { return requestId; }
    public void setRequestId(String requestId) { this.requestId = requestId; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getAuthor() { return author; }
    public void setAuthor(String author) { this.author = author; }

    public String getComment() { return comment; }
    public void setComment(String comment) { this.comment = comment; }

    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }
}
