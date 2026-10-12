package com.campusconnect.service;

import com.campusconnect.model.Notification;
import com.campusconnect.repository.NotificationRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public NotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    public List<Notification> getNotifications(String studentId) {
        return notificationRepository.findByStudentIdOrderByCreatedAtDesc(studentId);
    }

    public boolean markNotificationRead(String id, String studentId) {
        Optional<Notification> opt = notificationRepository.findByIdAndStudentId(id, studentId);
        if (opt.isPresent()) {
            Notification n = opt.get();
            n.setRead(true);
            notificationRepository.save(n);
            return true;
        }
        return false;
    }

    public void markAllNotificationsRead(String studentId) {
        List<Notification> list = notificationRepository.findByStudentIdOrderByCreatedAtDesc(studentId);
        list.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(list);
    }

    public Notification createNotification(String studentId, String type, String title, String message, String link) {
        String id = "notif-" + System.currentTimeMillis() + "-" + (int)(Math.random() * 1000);
        String dateStr = LocalDateTime.now().format(DateTimeFormatter.ofPattern("MMM dd, yyyy, hh:mm a"));
        Notification n = new Notification(id, studentId, type, title, message, dateStr, false, link);
        return notificationRepository.save(n);
    }
}
