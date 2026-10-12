package com.campusconnect.controller;

import com.campusconnect.dto.BadgeDto;
import com.campusconnect.dto.StreakDto;
import com.campusconnect.model.User;
import com.campusconnect.service.BadgeService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping
public class BadgeController {

    private final BadgeService badgeService;

    public BadgeController(BadgeService badgeService) {
        this.badgeService = badgeService;
    }

    @GetMapping("/badges")
    public ResponseEntity<List<BadgeDto>> getBadges(@AuthenticationPrincipal User student) {
        if (student == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(badgeService.getBadges(student.getId()));
    }

    @GetMapping("/streak")
    public ResponseEntity<StreakDto> getStreak(@AuthenticationPrincipal User student) {
        if (student == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(badgeService.getStreak(student.getId()));
    }
}
