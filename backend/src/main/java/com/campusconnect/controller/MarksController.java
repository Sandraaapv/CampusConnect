package com.campusconnect.controller;

import com.campusconnect.dto.PredictMarksRequest;
import com.campusconnect.dto.PredictMarksResultDto;
import com.campusconnect.model.MarkRecord;
import com.campusconnect.model.PastSemester;
import com.campusconnect.model.User;
import com.campusconnect.service.MarksService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/marks")
public class MarksController {

    private final MarksService marksService;

    public MarksController(MarksService marksService) {
        this.marksService = marksService;
    }

    @GetMapping
    public ResponseEntity<List<MarkRecord>> getMarks(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(marksService.getMarks(user.getId()));
    }

    @GetMapping("/history")
    public ResponseEntity<List<PastSemester>> getAcademicHistory(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(marksService.getAcademicHistory(user.getId()));
    }

    @GetMapping("/cumulative-cgpa")
    public ResponseEntity<Map<String, Object>> getCumulativeCgpa(@AuthenticationPrincipal User user) {
        double cgpa = marksService.getCumulativeCgpa(user.getId());
        return ResponseEntity.ok(Map.of("cumulativeCgpa", cgpa));
    }

    @PostMapping("/predict")
    public ResponseEntity<List<PredictMarksResultDto>> predictMarks(
            @AuthenticationPrincipal User user,
            @RequestBody PredictMarksRequest request) {
        double target = request.getTargetCgpa() != null ? request.getTargetCgpa() : 8.5;
        List<PredictMarksResultDto> predictions = marksService.predictMarks(user.getId(), target);
        return ResponseEntity.ok(predictions);
    }
}
