package com.campusconnect.repository;

import com.campusconnect.model.FacultyOfficeHour;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FacultyOfficeHourRepository extends JpaRepository<FacultyOfficeHour, Long> {
    List<FacultyOfficeHour> findByFacultyId(String facultyId);
}
