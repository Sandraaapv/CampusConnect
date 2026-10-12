package com.campusconnect.repository;

import com.campusconnect.model.AttendanceRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AttendanceRecordRepository extends JpaRepository<AttendanceRecord, String> {
    List<AttendanceRecord> findByStudentId(String studentId);
    List<AttendanceRecord> findByStudentIdAndSubjectId(String studentId, String subjectId);
    boolean existsByStudentIdAndSubjectIdAndDate(String studentId, String subjectId, String date);
}
