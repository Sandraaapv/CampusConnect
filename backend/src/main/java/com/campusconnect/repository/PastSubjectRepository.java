package com.campusconnect.repository;

import com.campusconnect.model.PastSubject;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PastSubjectRepository extends JpaRepository<PastSubject, Long> {
    List<PastSubject> findBySemesterId(Long semesterId);
}
