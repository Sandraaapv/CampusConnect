package com.campusconnect.controller;

import com.campusconnect.dto.AttendanceSummaryDto;
import com.campusconnect.model.AttendanceRecord;
import com.campusconnect.model.User;
import com.campusconnect.service.AttendanceService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/attendance")
public class AttendanceController {

    private final AttendanceService attendanceService;

    public AttendanceController(AttendanceService attendanceService) {
        this.attendanceService = attendanceService;
    }

    @GetMapping
    public ResponseEntity<List<AttendanceRecord>> getAttendance(@AuthenticationPrincipal User user) {
        List<AttendanceRecord> records = attendanceService.getAttendance(user.getId());
        return ResponseEntity.ok(records);
    }

    @GetMapping("/summary")
    public ResponseEntity<List<AttendanceSummaryDto>> getAttendanceSummary(@AuthenticationPrincipal User user) {
        List<AttendanceSummaryDto> summary = attendanceService.getAttendanceSummary(user.getId());
        return ResponseEntity.ok(summary);
    }
}
