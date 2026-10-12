package com.campusconnect.repository;

import com.campusconnect.model.MarkRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MarkRecordRepository extends JpaRepository<MarkRecord, Long> {
    List<MarkRecord> findByStudentId(String studentId);
    Optional<MarkRecord> findByStudentIdAndSubjectId(String studentId, String subjectId);
}
