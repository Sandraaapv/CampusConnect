package com.campusconnect.controller;

import com.campusconnect.model.Circular;
import com.campusconnect.model.User;
import com.campusconnect.service.CircularService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/circulars")
public class CircularController {

    private final CircularService circularService;

    public CircularController(CircularService circularService) {
        this.circularService = circularService;
    }

    @GetMapping
    public ResponseEntity<List<Circular>> getCirculars(
            @AuthenticationPrincipal User user,
            @RequestParam(required = false) String dept,
            @RequestParam(required = false) Integer sem,
            @RequestParam(required = false) String q) {
        String department = dept != null && !dept.isBlank() ? dept : (user != null ? user.getStudentRecord().getDepartment() : null);
        Integer semester = sem != null ? sem : (user != null ? user.getStudentRecord().getSemester() : null);
        List<Circular> circulars = circularService.getCirculars(department, semester, q);
        return ResponseEntity.ok(circulars);
    }
}
