package com.campusconnect.repository;

import com.campusconnect.model.HelpdeskTicket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface HelpdeskTicketRepository extends JpaRepository<HelpdeskTicket, String> {
    List<HelpdeskTicket> findByStudentIdOrderByCreatedAtDesc(String studentId);
    Optional<HelpdeskTicket> findByIdAndStudentId(String id, String studentId);
}
