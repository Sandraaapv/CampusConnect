package com.campusconnect.controller;

import com.campusconnect.dto.StudyPlanResultDto;
import com.campusconnect.model.Exam;
import com.campusconnect.model.SyllabusUnit;
import com.campusconnect.model.User;
import com.campusconnect.service.ExamService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping
public class ExamController {

    private final ExamService examService;

    public ExamController(ExamService examService) {
        this.examService = examService;
    }

    @GetMapping("/exams")
    public ResponseEntity<List<Exam>> getExams(@AuthenticationPrincipal User student) {
        if (student == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(examService.getExams(student.getId()));
    }

    @PostMapping("/exams")
    public ResponseEntity<Exam> createExam(
            @AuthenticationPrincipal User student,
            @RequestBody Exam exam) {
        if (student == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(examService.createExam(student.getId(), exam));
    }

    @GetMapping("/exams/plan")
    public ResponseEntity<StudyPlanResultDto> getStudyPlan(
            @AuthenticationPrincipal User student,
            @RequestParam(value = "dailyHours", required = false) Integer dailyHours) {
        if (student == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(examService.buildStudyPlan(student.getId(), dailyHours));
    }

    @GetMapping("/syllabus/units")
    public ResponseEntity<List<SyllabusUnit>> getSyllabusUnits() {
        return ResponseEntity.ok(examService.getSyllabusUnits());
    }

    @GetMapping("/syllabus/progress")
    public ResponseEntity<Map<String, Boolean>> getUnitProgress(@AuthenticationPrincipal User student) {
        if (student == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(examService.getStudentUnitProgress(student.getId()));
    }

    @PutMapping("/syllabus/progress")
    public ResponseEntity<Map<String, Object>> toggleUnitProgress(
            @AuthenticationPrincipal User student,
            @RequestBody Map<String, String> body) {
        if (student == null) return ResponseEntity.status(401).build();
        String unitId = body.get("unitId");
        if (unitId == null || unitId.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "unitId is required"));
        }
        boolean completed = examService.toggleUnitProgress(student.getId(), unitId);
        return ResponseEntity.ok(Map.of("unitId", unitId, "completed", completed, "success", true));
    }
}
