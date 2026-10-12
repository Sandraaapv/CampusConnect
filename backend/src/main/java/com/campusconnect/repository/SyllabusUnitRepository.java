package com.campusconnect.repository;

import com.campusconnect.model.SyllabusUnit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SyllabusUnitRepository extends JpaRepository<SyllabusUnit, String> {
    List<SyllabusUnit> findBySubjectIdOrderByUnitNoAsc(String subjectId);
    List<SyllabusUnit> findAllByOrderByUnitNoAsc();
}
