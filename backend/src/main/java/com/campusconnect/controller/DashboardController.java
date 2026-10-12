package com.campusconnect.controller;

import com.campusconnect.dto.DashboardDataDto;
import com.campusconnect.model.User;
import com.campusconnect.service.DashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping
    public ResponseEntity<DashboardDataDto> getDashboard(@AuthenticationPrincipal User user) {
        DashboardDataDto data = dashboardService.getDashboard(user.getId(), user.getStudentRecord());
        return ResponseEntity.ok(data);
    }
}
