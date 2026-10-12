package com.campusconnect.repository;

import com.campusconnect.model.FeeStructure;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FeeStructureRepository extends JpaRepository<FeeStructure, String> {
    List<FeeStructure> findBySemester(int semester);
}
