package com.campusconnect.repository;

import com.campusconnect.model.StudentRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentRequestRepository extends JpaRepository<StudentRequest, String> {
    List<StudentRequest> findByStudentIdOrderByCreatedAtDesc(String studentId);
    Optional<StudentRequest> findByIdAndStudentId(String id, String studentId);
    List<StudentRequest> findByStatusIn(List<String> statuses);
}
