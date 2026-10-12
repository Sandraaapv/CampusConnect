package com.campusconnect.model;

import jakarta.persistence.*;

@Entity
@Table(name = "badges")
public class Badge {

    @Id
    @Column(name = "id", length = 64)
    private String id;

    @Column(name = "title", nullable = false, length = 128)
    private String title;

    @Column(name = "description", nullable = false)
    private String description;

    @Column(name = "icon_name", nullable = false, length = 64)
    private String iconName;

    @Column(name = "hint", nullable = false)
    private String hint;

    public Badge() {}

    public Badge(String id, String title, String description, String iconName, String hint) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.iconName = iconName;
        this.hint = hint;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getIconName() { return iconName; }
    public void setIconName(String iconName) { this.iconName = iconName; }

    public String getHint() { return hint; }
    public void setHint(String hint) { this.hint = hint; }
}
