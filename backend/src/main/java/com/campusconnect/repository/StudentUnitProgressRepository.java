package com.campusconnect.repository;

import com.campusconnect.model.StudentUnitProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentUnitProgressRepository extends JpaRepository<StudentUnitProgress, Long> {
    List<StudentUnitProgress> findByStudentId(String studentId);
    Optional<StudentUnitProgress> findByStudentIdAndUnitId(String studentId, String unitId);
}
