package com.campusconnect.controller;

import com.campusconnect.model.Notification;
import com.campusconnect.model.User;
import com.campusconnect.service.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping
    public ResponseEntity<List<Notification>> getNotifications(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(notificationService.getNotifications(user.getId()));
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<Map<String, Object>> markNotificationRead(
            @AuthenticationPrincipal User user,
            @PathVariable String id) {
        boolean success = notificationService.markNotificationRead(id, user.getId());
        return ResponseEntity.ok(Map.of("success", success));
    }

    @PatchMapping("/read-all")
    public ResponseEntity<Map<String, Object>> markAllNotificationsRead(@AuthenticationPrincipal User user) {
        notificationService.markAllNotificationsRead(user.getId());
        return ResponseEntity.ok(Map.of("success", true));
    }
}
