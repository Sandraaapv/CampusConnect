package com.campusconnect.dto;

public class StreakDto {
    private int count;
    private boolean active;
    private String nextMilestone;

    public StreakDto() {}

    public StreakDto(int count, boolean active, String nextMilestone) {
        this.count = count;
        this.active = active;
        this.nextMilestone = nextMilestone;
    }

    public int getCount() { return count; }
    public void setCount(int count) { this.count = count; }

    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }

    public String getNextMilestone() { return nextMilestone; }
    public void setNextMilestone(String nextMilestone) { this.nextMilestone = nextMilestone; }
}
