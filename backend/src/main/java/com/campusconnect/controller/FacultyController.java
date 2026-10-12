package com.campusconnect.controller;

import com.campusconnect.dto.FacultyDto;
import com.campusconnect.service.FacultyService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/faculty")
public class FacultyController {

    private final FacultyService facultyService;

    public FacultyController(FacultyService facultyService) {
        this.facultyService = facultyService;
    }

    @GetMapping
    public ResponseEntity<List<FacultyDto>> getFaculty() {
        return ResponseEntity.ok(facultyService.getAllFaculty());
    }

    @GetMapping("/my")
    public ResponseEntity<List<FacultyDto>> getMyFaculty(Authentication authentication) {
        String studentId = (String) authentication.getPrincipal();
        return ResponseEntity.ok(facultyService.getMyFaculty(studentId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<FacultyDto> getFacultyById(@PathVariable String id) {
        FacultyDto dto = facultyService.getFacultyById(id);
        if (dto == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(dto);
    }
}
