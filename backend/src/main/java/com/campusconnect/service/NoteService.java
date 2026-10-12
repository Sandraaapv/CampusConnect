package com.campusconnect.service;

import com.campusconnect.dto.NoteDto;
import com.campusconnect.model.Note;
import com.campusconnect.model.NoteUpvote;
import com.campusconnect.model.User;
import com.campusconnect.repository.NoteRepository;
import com.campusconnect.repository.NoteUpvoteRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class NoteService {

    private final NoteRepository noteRepository;
    private final NoteUpvoteRepository noteUpvoteRepository;

    public NoteService(NoteRepository noteRepository, NoteUpvoteRepository noteUpvoteRepository) {
        this.noteRepository = noteRepository;
        this.noteUpvoteRepository = noteUpvoteRepository;
    }

    public List<NoteDto> getNotes(String subjectCode) {
        List<Note> notes;
        if (subjectCode != null && !subjectCode.isBlank() && !"All".equalsIgnoreCase(subjectCode)) {
            notes = noteRepository.findBySubjectCode(subjectCode);
        } else {
            notes = noteRepository.findAll();
        }

        List<NoteUpvote> allUpvotes = noteUpvoteRepository.findAll();
        Map<String, List<String>> upvotesByNote = allUpvotes.stream()
                .collect(Collectors.groupingBy(
                        NoteUpvote::getNoteId,
                        Collectors.mapping(NoteUpvote::getStudentId, Collectors.toList())
                ));

        return notes.stream().map(n -> new NoteDto(
                n.getId(),
                n.getSubjectId(),
                n.getSubjectCode(),
                n.getTitle(),
                n.getFileType(),
                n.getUploadedBy(),
                n.getUploadedDate(),
                n.getUpvotes(),
                upvotesByNote.getOrDefault(n.getId(), Collections.emptyList())
        )).collect(Collectors.toList());
    }

    @Transactional
    public NoteDto createNote(User student, Note noteInput) {
        if (noteInput.getTitle() == null || noteInput.getTitle().isBlank()) {
            throw new IllegalArgumentException("Title cannot be blank");
        }
        String fileType = noteInput.getFileType();
        if (fileType == null || (!fileType.equals("PDF") && !fileType.equals("Notes") && !fileType.equals("PYQ"))) {
            fileType = "PDF";
        }

        String noteId = "note-" + System.currentTimeMillis();
        Note note = new Note(
                noteId,
                noteInput.getSubjectId() != null ? noteInput.getSubjectId() : "sub-cs101",
                noteInput.getSubjectCode() != null ? noteInput.getSubjectCode() : "CS101",
                noteInput.getTitle(),
                fileType,
                student.getName(),
                LocalDate.now().toString(),
                0
        );

        noteRepository.save(note);
        return new NoteDto(
                note.getId(),
                note.getSubjectId(),
                note.getSubjectCode(),
                note.getTitle(),
                note.getFileType(),
                note.getUploadedBy(),
                note.getUploadedDate(),
                note.getUpvotes(),
                Collections.emptyList()
        );
    }

    @Transactional
    public NoteDto upvoteNote(String noteId, String studentId) {
        Note note = noteRepository.findById(noteId)
                .orElseThrow(() -> new IllegalArgumentException("Note not found: " + noteId));

        Optional<NoteUpvote> existing = noteUpvoteRepository.findByNoteIdAndStudentId(noteId, studentId);
        if (existing.isPresent()) {
            noteUpvoteRepository.deleteByNoteIdAndStudentId(noteId, studentId);
            note.setUpvotes(Math.max(0, note.getUpvotes() - 1));
        } else {
            noteUpvoteRepository.save(new NoteUpvote(noteId, studentId));
            note.setUpvotes(note.getUpvotes() + 1);
        }
        noteRepository.save(note);

        List<String> upvotedBy = noteUpvoteRepository.findByNoteId(noteId).stream()
                .map(NoteUpvote::getStudentId)
                .collect(Collectors.toList());

        return new NoteDto(
                note.getId(),
                note.getSubjectId(),
                note.getSubjectCode(),
                note.getTitle(),
                note.getFileType(),
                note.getUploadedBy(),
                note.getUploadedDate(),
                note.getUpvotes(),
                upvotedBy
        );
    }
}
