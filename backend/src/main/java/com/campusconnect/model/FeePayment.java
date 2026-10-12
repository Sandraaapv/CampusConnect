package com.campusconnect.model;

import jakarta.persistence.*;

@Entity
@Table(name = "fee_payments")
public class FeePayment {

    @Id
    @Column(name = "id", length = 64)
    private String id;

    @Column(name = "student_id", nullable = false, length = 64)
    private String studentId;

    @Column(name = "semester", nullable = false)
    private int semester;

    @Column(name = "amount", nullable = false)
    private double amount;

    @Column(name = "mode", nullable = false, length = 32)
    private String mode;

    @Column(name = "reference_number", nullable = false, length = 128)
    private String reference;

    @Column(name = "paid_at", nullable = false, length = 64)
    private String paidAt;

    @Column(name = "status", nullable = false, length = 32)
    private String status; // success, pending, failed

    @Column(name = "description", nullable = false)
    private String description;

    @Column(name = "last4", length = 4)
    private String last4;

    public FeePayment() {}

    public FeePayment(String id, String studentId, int semester, double amount, String mode, String reference, String paidAt, String status, String description, String last4) {
        this.id = id;
        this.studentId = studentId;
        this.semester = semester;
        this.amount = amount;
        this.mode = mode;
        this.reference = reference;
        this.paidAt = paidAt;
        this.status = status;
        this.description = description;
        this.last4 = last4;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getStudentId() { return studentId; }
    public void setStudentId(String studentId) { this.studentId = studentId; }

    public int getSemester() { return semester; }
    public void setSemester(int semester) { this.semester = semester; }

    public double getAmount() { return amount; }
    public void setAmount(double amount) { this.amount = amount; }

    public String getMode() { return mode; }
    public void setMode(String mode) { this.mode = mode; }

    public String getReference() { return reference; }
    public void setReference(String reference) { this.reference = reference; }

    public String getPaidAt() { return paidAt; }
    public void setPaidAt(String paidAt) { this.paidAt = paidAt; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getLast4() { return last4; }
    public void setLast4(String last4) { this.last4 = last4; }
}
