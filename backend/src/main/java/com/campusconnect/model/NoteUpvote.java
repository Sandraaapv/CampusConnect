package com.campusconnect.model;

import jakarta.persistence.*;

@Entity
@Table(name = "note_upvotes", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"note_id", "student_id"})
})
public class NoteUpvote {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "note_id", nullable = false, length = 64)
    private String noteId;

    @Column(name = "student_id", nullable = false, length = 64)
    private String studentId;

    public NoteUpvote() {}

    public NoteUpvote(String noteId, String studentId) {
        this.noteId = noteId;
        this.studentId = studentId;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getNoteId() { return noteId; }
    public void setNoteId(String noteId) { this.noteId = noteId; }

    public String getStudentId() { return studentId; }
    public void setStudentId(String studentId) { this.studentId = studentId; }
}
