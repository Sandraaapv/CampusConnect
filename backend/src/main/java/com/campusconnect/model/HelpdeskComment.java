package com.campusconnect.model;

import jakarta.persistence.*;

@Entity
@Table(name = "helpdesk_comments")
public class HelpdeskComment {

    @Id
    @Column(name = "id", length = 64)
    private String id;

    @Column(name = "ticket_id", nullable = false, length = 64)
    private String ticketId;

    @Column(name = "author_type", nullable = false, length = 32)
    private String authorType; // student, support

    @Column(name = "author_name", nullable = false, length = 128)
    private String authorName;

    @Column(name = "message", nullable = false, columnDefinition = "TEXT")
    private String message;

    @Column(name = "created_at", nullable = false, length = 64)
    private String createdAt;

    public HelpdeskComment() {}

    public HelpdeskComment(String id, String ticketId, String authorType, String authorName, String message, String createdAt) {
        this.id = id;
        this.ticketId = ticketId;
        this.authorType = authorType;
        this.authorName = authorName;
        this.message = message;
        this.createdAt = createdAt;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getTicketId() { return ticketId; }
    public void setTicketId(String ticketId) { this.ticketId = ticketId; }

    public String getAuthorType() { return authorType; }
    public void setAuthorType(String authorType) { this.authorType = authorType; }

    public String getAuthorName() { return authorName; }
    public void setAuthorName(String authorName) { this.authorName = authorName; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
}
