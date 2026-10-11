package com.campusconnect.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "login_events", indexes = {
    @Index(name = "idx_login_event_user", columnList = "user_id"),
    @Index(name = "idx_login_event_at", columnList = "at")
})
public class LoginEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", length = 64)
    private String userId;

    @Column(name = "ip", length = 64)
    private String ip;

    @Column(name = "device", length = 255)
    private String device;

    @Column(name = "success", nullable = false)
    private boolean success;

    @Column(name = "reason", length = 128)
    private String reason;

    @Column(name = "at", nullable = false)
    private LocalDateTime at = LocalDateTime.now();

    public LoginEvent() {}

    public LoginEvent(String userId, String ip, String device, boolean success, String reason) {
        this.userId = userId;
        this.ip = ip;
        this.device = device;
        this.success = success;
        this.reason = reason;
        this.at = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getIp() { return ip; }
    public void setIp(String ip) { this.ip = ip; }

    public String getDevice() { return device; }
    public void setDevice(String device) { this.device = device; }

    public boolean isSuccess() { return success; }
    public void setSuccess(boolean success) { this.success = success; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }

    public LocalDateTime getAt() { return at; }
    public void setAt(LocalDateTime at) { this.at = at; }
}
