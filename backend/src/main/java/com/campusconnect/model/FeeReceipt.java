package com.campusconnect.model;

import jakarta.persistence.*;

@Entity
@Table(name = "fee_receipts")
public class FeeReceipt {

    @Id
    @Column(name = "id", length = 64)
    private String id;

    @Column(name = "payment_id", nullable = false, length = 64)
    private String paymentId;

    @Column(name = "receipt_number", nullable = false, length = 64)
    private String receiptNumber;

    @Column(name = "verify_token", nullable = false, length = 128)
    private String verifyToken;

    @Column(name = "college_name", nullable = false, length = 128)
    private String collegeName;

    @Column(name = "student_name", nullable = false, length = 128)
    private String studentName;

    @Column(name = "register_number", nullable = false, length = 32)
    private String registerNumber;

    @Column(name = "department", nullable = false, length = 128)
    private String department;

    @Column(name = "semester", nullable = false)
    private int semester;

    @Column(name = "amount", nullable = false)
    private double amount;

    @Column(name = "paid_date", nullable = false, length = 64)
    private String paidDate;

    @Column(name = "payment_mode", nullable = false, length = 32)
    private String paymentMode;

    @Column(name = "payment_ref", nullable = false, length = 128)
    private String paymentRef;

    @Column(name = "description", nullable = false)
    private String description;

    public FeeReceipt() {}

    public FeeReceipt(String id, String paymentId, String receiptNumber, String verifyToken, String collegeName, String studentName, String registerNumber, String department, int semester, double amount, String paidDate, String paymentMode, String paymentRef, String description) {
        this.id = id;
        this.paymentId = paymentId;
        this.receiptNumber = receiptNumber;
        this.verifyToken = verifyToken;
        this.collegeName = collegeName;
        this.studentName = studentName;
        this.registerNumber = registerNumber;
        this.department = department;
        this.semester = semester;
        this.amount = amount;
        this.paidDate = paidDate;
        this.paymentMode = paymentMode;
        this.paymentRef = paymentRef;
        this.description = description;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getPaymentId() { return paymentId; }
    public void setPaymentId(String paymentId) { this.paymentId = paymentId; }

    public String getReceiptNumber() { return receiptNumber; }
    public void setReceiptNumber(String receiptNumber) { this.receiptNumber = receiptNumber; }

    public String getVerifyToken() { return verifyToken; }
    public void setVerifyToken(String verifyToken) { this.verifyToken = verifyToken; }

    public String getCollegeName() { return collegeName; }
    public void setCollegeName(String collegeName) { this.collegeName = collegeName; }

    public String getStudentName() { return studentName; }
    public void setStudentName(String studentName) { this.studentName = studentName; }

    public String getRegisterNumber() { return registerNumber; }
    public void setRegisterNumber(String registerNumber) { this.registerNumber = registerNumber; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public int getSemester() { return semester; }
    public void setSemester(int semester) { this.semester = semester; }

    public double getAmount() { return amount; }
    public void setAmount(double amount) { this.amount = amount; }

    public String getPaidDate() { return paidDate; }
    public void setPaidDate(String paidDate) { this.paidDate = paidDate; }

    public String getPaymentMode() { return paymentMode; }
    public void setPaymentMode(String paymentMode) { this.paymentMode = paymentMode; }

    public String getPaymentRef() { return paymentRef; }
    public void setPaymentRef(String paymentRef) { this.paymentRef = paymentRef; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}
