package com.campusconnect.model;

import jakarta.persistence.*;

@Entity
@Table(name = "request_dept_stages")
public class RequestDeptStage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "request_id", nullable = false, length = 64)
    private String requestId;

    @Column(name = "department", nullable = false, length = 64)
    private String department; // Library, Hostel, Accounts, Labs

    @Column(name = "cleared", nullable = false)
    private boolean cleared = false;

    @Column(name = "cleared_at", length = 32)
    private String clearedAt;

    @Column(name = "remarks", length = 255)
    private String remarks;

    public RequestDeptStage() {}

    public RequestDeptStage(String requestId, String department, boolean cleared, String clearedAt, String remarks) {
        this.requestId = requestId;
        this.department = department;
        this.cleared = cleared;
        this.clearedAt = clearedAt;
        this.remarks = remarks;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getRequestId() { return requestId; }
    public void setRequestId(String requestId) { this.requestId = requestId; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public boolean isCleared() { return cleared; }
    public void setCleared(boolean cleared) { this.cleared = cleared; }

    public String getClearedAt() { return clearedAt; }
    public void setClearedAt(String clearedAt) { this.clearedAt = clearedAt; }

    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }
}
