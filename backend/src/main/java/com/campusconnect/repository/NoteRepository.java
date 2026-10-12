package com.campusconnect.repository;

import com.campusconnect.model.Note;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NoteRepository extends JpaRepository<Note, String> {
    List<Note> findBySubjectCodeOrderByUpvotesDesc(String subjectCode);
    List<Note> findAllByOrderByUpvotesDesc();
}
