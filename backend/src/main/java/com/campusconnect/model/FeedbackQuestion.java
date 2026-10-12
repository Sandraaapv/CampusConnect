package com.campusconnect.model;

import jakarta.persistence.*;

@Entity
@Table(name = "feedback_questions")
public class FeedbackQuestion {

    @Id
    @Column(name = "id", length = 64)
    private String id;

    @Column(name = "category", nullable = false, length = 64)
    private String category;

    @Column(name = "text", nullable = false)
    private String text;

    public FeedbackQuestion() {}

    public FeedbackQuestion(String id, String category, String text) {
        this.id = id;
        this.category = category;
        this.text = text;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getText() { return text; }
    public void setText(String text) { this.text = text; }
}
