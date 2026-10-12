package com.campusconnect.repository;

import com.campusconnect.model.ClassChange;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ClassChangeRepository extends JpaRepository<ClassChange, String> {
    List<ClassChange> findByDate(String date);
}
