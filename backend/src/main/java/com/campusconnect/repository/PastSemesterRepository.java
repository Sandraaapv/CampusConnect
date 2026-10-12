package com.campusconnect.repository;

import com.campusconnect.model.PastSemester;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PastSemesterRepository extends JpaRepository<PastSemester, Long> {
    List<PastSemester> findByStudentIdOrderBySemesterAsc(String studentId);
}
