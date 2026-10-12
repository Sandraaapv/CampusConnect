package com.campusconnect.dto;

public class BadgeDto {
    private String id;
    private String title;
    private String description;
    private String iconName;
    private boolean unlocked;
    private String unlockedAt;
    private String hint;

    public BadgeDto() {}

    public BadgeDto(String id, String title, String description, String iconName,
                    boolean unlocked, String unlockedAt, String hint) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.iconName = iconName;
        this.unlocked = unlocked;
        this.unlockedAt = unlockedAt;
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

    public boolean isUnlocked() { return unlocked; }
    public void setUnlocked(boolean unlocked) { this.unlocked = unlocked; }

    public String getUnlockedAt() { return unlockedAt; }
    public void setUnlockedAt(String unlockedAt) { this.unlockedAt = unlockedAt; }

    public String getHint() { return hint; }
    public void setHint(String hint) { this.hint = hint; }
}
