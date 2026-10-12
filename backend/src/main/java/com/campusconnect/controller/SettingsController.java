package com.campusconnect.controller;

import com.campusconnect.model.User;
import com.campusconnect.service.SettingsService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/settings")
public class SettingsController {

    private final SettingsService settingsService;

    public SettingsController(SettingsService settingsService) {
        this.settingsService = settingsService;
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getSettings(@AuthenticationPrincipal User student) {
        if (student == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(settingsService.getSettings(student.getId()));
    }

    @PutMapping
    public ResponseEntity<Map<String, Object>> updateSettings(
            @AuthenticationPrincipal User student,
            @RequestBody Map<String, Object> updates) {
        if (student == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(settingsService.updateSettings(student.getId(), updates));
    }
}
