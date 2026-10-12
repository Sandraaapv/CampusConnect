package com.campusconnect.repository;

import com.campusconnect.model.HelpdeskComment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HelpdeskCommentRepository extends JpaRepository<HelpdeskComment, String> {
    List<HelpdeskComment> findByTicketIdOrderByCreatedAtAsc(String ticketId);
}
