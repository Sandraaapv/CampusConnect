package com.campusconnect.repository;

import com.campusconnect.model.NoteUpvote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface NoteUpvoteRepository extends JpaRepository<NoteUpvote, Long> {
    Optional<NoteUpvote> findByNoteIdAndStudentId(String noteId, String studentId);
    List<NoteUpvote> findByNoteId(String noteId);
    List<NoteUpvote> findByStudentId(String studentId);
    void deleteByNoteIdAndStudentId(String noteId, String studentId);
}
