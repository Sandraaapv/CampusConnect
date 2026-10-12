package com.campusconnect.repository;

import com.campusconnect.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, String> {
    List<Notification> findByStudentIdOrderByCreatedAtDesc(String studentId);
    Optional<Notification> findByIdAndStudentId(String id, String studentId);
}
