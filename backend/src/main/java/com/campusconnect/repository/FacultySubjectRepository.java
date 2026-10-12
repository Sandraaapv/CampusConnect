package com.campusconnect.repository;

import com.campusconnect.model.FacultySubject;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FacultySubjectRepository extends JpaRepository<FacultySubject, Long> {
    List<FacultySubject> findByFacultyId(String facultyId);
}
