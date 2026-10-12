package com.campusconnect.model;

import jakarta.persistence.*;

@Entity
@Table(name = "circulars")
public class Circular {

    @Id
    @Column(name = "id", length = 64)
    private String id;

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "department", nullable = false, length = 128)
    private String department;

    @Column(name = "semester")
    private Integer semester;

    @Column(name = "category", nullable = false, length = 64)
    private String category; // Exam, Academic, Event, Hostel, Scholarship

    @Column(name = "circular_date", nullable = false, length = 16)
    private String date; // YYYY-MM-DD

    @Column(name = "content", nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(name = "tags")
    private String tags; // comma separated

    public Circular() {}

    public Circular(String id, String title, String department, Integer semester, String category, String date, String content, String tags) {
        this.id = id;
        this.title = title;
        this.department = department;
        this.semester = semester;
        this.category = category;
        this.date = date;
        this.content = content;
        this.tags = tags;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public Integer getSemester() { return semester; }
    public void setSemester(Integer semester) { this.semester = semester; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public String getTags() { return tags; }
    public void setTags(String tags) { this.tags = tags; }
}
