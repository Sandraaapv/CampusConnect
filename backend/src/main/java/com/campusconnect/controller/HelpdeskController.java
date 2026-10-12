package com.campusconnect.controller;

import com.campusconnect.model.HelpdeskTicket;
import com.campusconnect.model.User;
import com.campusconnect.service.HelpdeskService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/helpdesk")
public class HelpdeskController {

    private final HelpdeskService helpdeskService;

    public HelpdeskController(HelpdeskService helpdeskService) {
        this.helpdeskService = helpdeskService;
    }

    private String getStudentId(Authentication authentication) {
        if (authentication == null) return null;
        Object principal = authentication.getPrincipal();
        if (principal instanceof User user) {
            return user.getId();
        }
        return principal != null ? principal.toString() : null;
    }

    @GetMapping
    public ResponseEntity<List<HelpdeskTicket>> getTickets(Authentication authentication) {
        String studentId = getStudentId(authentication);
        return ResponseEntity.ok(helpdeskService.getTicketsForStudent(studentId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getTicketById(Authentication authentication, @PathVariable String id) {
        String studentId = getStudentId(authentication);
        Map<String, Object> data = helpdeskService.getTicketById(studentId, id);
        if (data == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(data);
    }

    public static class CreateTicketRequest {
        public String category;
        public String priority;
        public String title;
        public String description;
        public String location;
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> createTicket(
            Authentication authentication,
            @RequestBody CreateTicketRequest req) {
        String studentId = getStudentId(authentication);
        Map<String, Object> result = helpdeskService.createTicket(
                studentId, req.category, req.priority, req.title, req.description, req.location
        );
        return ResponseEntity.ok(result);
    }

    public static class CommentRequest {
        public String message;
    }

    @PostMapping("/{id}/comment")
    public ResponseEntity<Map<String, Object>> addComment(
            Authentication authentication,
            @PathVariable String id,
            @RequestBody CommentRequest req) {
        String studentId = getStudentId(authentication);
        Map<String, Object> result = helpdeskService.addComment(studentId, id, req.message);
        return ResponseEntity.ok(result);
    }

    public static class UpdateTicketRequest {
        public String action;
        public Integer rating;
    }

    @PatchMapping("/{id}")
    public ResponseEntity<Map<String, Object>> updateTicket(
            Authentication authentication,
            @PathVariable String id,
            @RequestBody UpdateTicketRequest req) {
        String studentId = getStudentId(authentication);
        Map<String, Object> result = helpdeskService.updateTicket(studentId, id, req.action, req.rating);
        return ResponseEntity.ok(result);
    }
}
