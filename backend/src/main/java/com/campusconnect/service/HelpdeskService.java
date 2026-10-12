package com.campusconnect.service;

import com.campusconnect.model.HelpdeskComment;
import com.campusconnect.model.HelpdeskTicket;
import com.campusconnect.model.User;
import com.campusconnect.repository.HelpdeskCommentRepository;
import com.campusconnect.repository.HelpdeskTicketRepository;
import com.campusconnect.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.util.*;

@Service
public class HelpdeskService {

    private final HelpdeskTicketRepository ticketRepository;
    private final HelpdeskCommentRepository commentRepository;
    private final UserRepository userRepository;

    public HelpdeskService(
            HelpdeskTicketRepository ticketRepository,
            HelpdeskCommentRepository commentRepository,
            UserRepository userRepository) {
        this.ticketRepository = ticketRepository;
        this.commentRepository = commentRepository;
        this.userRepository = userRepository;
    }

    public List<HelpdeskTicket> getTicketsForStudent(String studentId) {
        return ticketRepository.findByStudentIdOrderByCreatedAtDesc(studentId);
    }

    public Map<String, Object> getTicketById(String studentId, String ticketId) {
        Optional<HelpdeskTicket> opt = ticketRepository.findById(ticketId);
        if (opt.isEmpty() || !opt.get().getStudentId().equals(studentId)) {
            return null;
        }
        HelpdeskTicket ticket = opt.get();
        List<HelpdeskComment> comments = commentRepository.findByTicketIdOrderByCreatedAtAsc(ticketId);
        return Map.of("ticket", ticket, "comments", comments);
    }

    @Transactional
    public Map<String, Object> createTicket(String studentId, String category, String priority, String title, String description, String location) {
        // Daily rate limit: max 5 tickets per day
        String today = LocalDate.now().toString();
        long countToday = ticketRepository.findByStudentIdOrderByCreatedAtDesc(studentId).stream()
                .filter(t -> t.getCreatedAt() != null && t.getCreatedAt().startsWith(today))
                .count();
        if (countToday >= 5) {
            return Map.of("success", false, "error", "Daily limit reached: Maximum 5 support tickets per day allowed.");
        }

        String assignedDept;
        if ("Wi-Fi / Network".equalsIgnoreCase(category)) {
            assignedDept = "Campus IT & Network Operations";
        } else if ("Hostel Maintenance".equalsIgnoreCase(category)) {
            assignedDept = "Hostel Estate & Facilities";
        } else if ("Library".equalsIgnoreCase(category)) {
            assignedDept = "Central Library Services";
        } else if ("Transport".equalsIgnoreCase(category)) {
            assignedDept = "Campus Transport Office";
        } else {
            assignedDept = "Student Affairs & Administration";
        }

        String ticketNumber = "HD-2026-" + (1000 + new Random().nextInt(9000));
        String id = "tkt-" + System.currentTimeMillis();
        String now = Instant.now().toString();

        HelpdeskTicket ticket = new HelpdeskTicket(
                id,
                ticketNumber,
                studentId,
                category,
                priority != null ? priority : "Medium",
                title,
                description,
                location != null ? location : "Campus",
                "Open",
                assignedDept,
                null,
                now,
                now
        );
        HelpdeskTicket saved = ticketRepository.save(ticket);
        return Map.of("success", true, "ticket", saved);
    }

    @Transactional
    public Map<String, Object> addComment(String studentId, String ticketId, String message) {
        Optional<HelpdeskTicket> opt = ticketRepository.findById(ticketId);
        if (opt.isEmpty() || !opt.get().getStudentId().equals(studentId)) {
            return Map.of("success", false, "error", "Ticket not found or access denied.");
        }

        User user = userRepository.findById(studentId).orElse(null);
        String authorName = (user != null && user.getName() != null) ? user.getName() : "Student";

        String commentId = "hdc-" + System.currentTimeMillis();
        HelpdeskComment comment = new HelpdeskComment(
                commentId,
                ticketId,
                "student",
                authorName,
                message,
                Instant.now().toString()
        );
        commentRepository.save(comment);

        // Update ticket updated_at
        HelpdeskTicket t = opt.get();
        t.setUpdatedAt(Instant.now().toString());
        ticketRepository.save(t);

        return Map.of("success", true, "comment", comment);
    }

    @Transactional
    public Map<String, Object> updateTicket(String studentId, String ticketId, String action, Integer rating) {
        Optional<HelpdeskTicket> opt = ticketRepository.findById(ticketId);
        if (opt.isEmpty() || !opt.get().getStudentId().equals(studentId)) {
            return Map.of("success", false, "error", "Ticket not found or access denied.");
        }

        HelpdeskTicket t = opt.get();
        if ("close".equalsIgnoreCase(action)) {
            t.setStatus("Closed");
            if (rating != null) {
                t.setRating(rating);
            }
        } else if ("reopen".equalsIgnoreCase(action)) {
            t.setStatus("Open");
        }
        t.setUpdatedAt(Instant.now().toString());
        ticketRepository.save(t);

        return Map.of("success", true, "ticket", t);
    }
}
