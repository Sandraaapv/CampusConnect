package com.campusconnect.model;

import jakarta.persistence.*;

@Entity
@Table(name = "class_changes")
public class ClassChange {

    @Id
    @Column(name = "id", length = 64)
    private String id;

    @Column(name = "slot_id", nullable = false, length = 64)
    private String slotId;

    @Column(name = "change_date", nullable = false, length = 16)
    private String date; // YYYY-MM-DD

    @Column(name = "change_type", nullable = false, length = 32)
    private String type; // cancelled, rescheduled, room_changed

    @Column(name = "new_room", length = 64)
    private String newRoom;

    @Column(name = "new_time", length = 32)
    private String newTime;

    @Column(name = "note", columnDefinition = "TEXT")
    private String note;

    public ClassChange() {}

    public ClassChange(String id, String slotId, String date, String type, String newRoom, String newTime, String note) {
        this.id = id;
        this.slotId = slotId;
        this.date = date;
        this.type = type;
        this.newRoom = newRoom;
        this.newTime = newTime;
        this.note = note;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getSlotId() { return slotId; }
    public void setSlotId(String slotId) { this.slotId = slotId; }

    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getNewRoom() { return newRoom; }
    public void setNewRoom(String newRoom) { this.newRoom = newRoom; }

    public String getNewTime() { return newTime; }
    public void setNewTime(String newTime) { this.newTime = newTime; }

    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }
}
