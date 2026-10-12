package com.campusconnect.dto;

import com.campusconnect.model.*;

import java.util.List;
import java.util.Map;

public class DashboardDataDto {

    private UrgentHeroDto urgentHero;
    private List<AttendanceSummaryDto> summary;
    private List<AttendanceSummaryDto> urgentAttendance;
    private List<Assignment> pendingAssignments;
    private List<Exam> upcomingExams;
    private List<Circular> latestCirculars;
    private StreakDto streak;
    private List<Badge> unlockedBadges;
    private List<TimetableSlotWithChangeDto> todaySlots;
    private List<TimetableSlotWithChangeDto> changedSlots;
    private int pendingFeedbackCount;
    private int openHelpdeskCount;
    private Map<String, Object> feeSummary;
    private boolean feeDueSoon;

    public static class UrgentHeroDto {
        private String category;
        private String title;
        private String highlight;
        private String description;
        private String actionText;
        private String actionPath;

        public UrgentHeroDto() {}

        public UrgentHeroDto(String category, String title, String highlight, String description, String actionText, String actionPath) {
            this.category = category;
            this.title = title;
            this.highlight = highlight;
            this.description = description;
            this.actionText = actionText;
            this.actionPath = actionPath;
        }

        public String getCategory() { return category; }
        public void setCategory(String category) { this.category = category; }

        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }

        public String getHighlight() { return highlight; }
        public void setHighlight(String highlight) { this.highlight = highlight; }

        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }

        public String getActionText() { return actionText; }
        public void setActionText(String actionText) { this.actionText = actionText; }

        public String getActionPath() { return actionPath; }
        public void setActionPath(String actionPath) { this.actionPath = actionPath; }
    }

    public static class StreakDto {
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

    public static class TimetableSlotWithChangeDto {
        private String id;
        private String day;
        private int period;
        private String startTime;
        private String endTime;
        private String subjectId;
        private String subjectCode;
        private String subjectName;
        private String room;
        private String facultyId;
        private String facultyName;
        private String slotType;
        private String colorKey;
        private ClassChange change;

        public TimetableSlotWithChangeDto() {}

        public TimetableSlotWithChangeDto(TimetableSlot slot, ClassChange change) {
            this.id = slot.getId();
            this.day = slot.getDay();
            this.period = slot.getPeriod();
            this.startTime = slot.getStartTime();
            this.endTime = slot.getEndTime();
            this.subjectId = slot.getSubjectId();
            this.subjectCode = slot.getSubjectCode();
            this.subjectName = slot.getSubjectName();
            this.room = slot.getRoom();
            this.facultyId = slot.getFacultyId();
            this.facultyName = slot.getFacultyName();
            this.slotType = slot.getSlotType();
            this.colorKey = slot.getColorKey();
            this.change = change;
        }

        public String getId() { return id; }
        public void setId(String id) { this.id = id; }

        public String getDay() { return day; }
        public void setDay(String day) { this.day = day; }

        public int getPeriod() { return period; }
        public void setPeriod(int period) { this.period = period; }

        public String getStartTime() { return startTime; }
        public void setStartTime(String startTime) { this.startTime = startTime; }

        public String getEndTime() { return endTime; }
        public void setEndTime(String endTime) { this.endTime = endTime; }

        public String getSubjectId() { return subjectId; }
        public void setSubjectId(String subjectId) { this.subjectId = subjectId; }

        public String getSubjectCode() { return subjectCode; }
        public void setSubjectCode(String subjectCode) { this.subjectCode = subjectCode; }

        public String getSubjectName() { return subjectName; }
        public void setSubjectName(String subjectName) { this.subjectName = subjectName; }

        public String getRoom() { return room; }
        public void setRoom(String room) { this.room = room; }

        public String getFacultyId() { return facultyId; }
        public void setFacultyId(String facultyId) { this.facultyId = facultyId; }

        public String getFacultyName() { return facultyName; }
        public void setFacultyName(String facultyName) { this.facultyName = facultyName; }

        public String getSlotType() { return slotType; }
        public void setSlotType(String slotType) { this.slotType = slotType; }

        public String getColorKey() { return colorKey; }
        public void setColorKey(String colorKey) { this.colorKey = colorKey; }

        public ClassChange getChange() { return change; }
        public void setChange(ClassChange change) { this.change = change; }
    }

    public DashboardDataDto() {}

    public UrgentHeroDto getUrgentHero() { return urgentHero; }
    public void setUrgentHero(UrgentHeroDto urgentHero) { this.urgentHero = urgentHero; }

    public List<AttendanceSummaryDto> getSummary() { return summary; }
    public void setSummary(List<AttendanceSummaryDto> summary) { this.summary = summary; }

    public List<AttendanceSummaryDto> getUrgentAttendance() { return urgentAttendance; }
    public void setUrgentAttendance(List<AttendanceSummaryDto> urgentAttendance) { this.urgentAttendance = urgentAttendance; }

    public List<Assignment> getPendingAssignments() { return pendingAssignments; }
    public void setPendingAssignments(List<Assignment> pendingAssignments) { this.pendingAssignments = pendingAssignments; }

    public List<Exam> getUpcomingExams() { return upcomingExams; }
    public void setUpcomingExams(List<Exam> upcomingExams) { this.upcomingExams = upcomingExams; }

    public List<Circular> getLatestCirculars() { return latestCirculars; }
    public void setLatestCirculars(List<Circular> latestCirculars) { this.latestCirculars = latestCirculars; }

    public StreakDto getStreak() { return streak; }
    public void setStreak(StreakDto streak) { this.streak = streak; }

    public List<Badge> getUnlockedBadges() { return unlockedBadges; }
    public void setUnlockedBadges(List<Badge> unlockedBadges) { this.unlockedBadges = unlockedBadges; }

    public List<TimetableSlotWithChangeDto> getTodaySlots() { return todaySlots; }
    public void setTodaySlots(List<TimetableSlotWithChangeDto> todaySlots) { this.todaySlots = todaySlots; }

    public List<TimetableSlotWithChangeDto> getChangedSlots() { return changedSlots; }
    public void setChangedSlots(List<TimetableSlotWithChangeDto> changedSlots) { this.changedSlots = changedSlots; }

    public int getPendingFeedbackCount() { return pendingFeedbackCount; }
    public void setPendingFeedbackCount(int pendingFeedbackCount) { this.pendingFeedbackCount = pendingFeedbackCount; }

    public int getOpenHelpdeskCount() { return openHelpdeskCount; }
    public void setOpenHelpdeskCount(int openHelpdeskCount) { this.openHelpdeskCount = openHelpdeskCount; }

    public Map<String, Object> getFeeSummary() { return feeSummary; }
    public void setFeeSummary(Map<String, Object> feeSummary) { this.feeSummary = feeSummary; }

    public boolean isFeeDueSoon() { return feeDueSoon; }
    public void setFeeDueSoon(boolean feeDueSoon) { this.feeDueSoon = feeDueSoon; }
}
