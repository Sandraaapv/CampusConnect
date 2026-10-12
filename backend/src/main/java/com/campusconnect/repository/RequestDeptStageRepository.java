package com.campusconnect.repository;

import com.campusconnect.model.RequestDeptStage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RequestDeptStageRepository extends JpaRepository<RequestDeptStage, Long> {
    List<RequestDeptStage> findByRequestIdOrderByIdAsc(String requestId);
}
