package com.campusconnect.controller;

import com.campusconnect.dto.NoteDto;
import com.campusconnect.model.Note;
import com.campusconnect.model.User;
import com.campusconnect.service.NoteService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/notes")
public class NoteController {

    private final NoteService noteService;

    public NoteController(NoteService noteService) {
        this.noteService = noteService;
    }

    @GetMapping
    public ResponseEntity<List<NoteDto>> getNotes(
            @RequestParam(value = "subjectCode", required = false) String subjectCode) {
        return ResponseEntity.ok(noteService.getNotes(subjectCode));
    }

    @PostMapping
    public ResponseEntity<NoteDto> createNote(
            @AuthenticationPrincipal User student,
            @RequestBody Note note) {
        if (student == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(noteService.createNote(student, note));
    }

    @PostMapping("/{id}/upvote")
    public ResponseEntity<NoteDto> upvoteNote(
            @AuthenticationPrincipal User student,
            @PathVariable("id") String id) {
        if (student == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(noteService.upvoteNote(id, student.getId()));
    }
}
