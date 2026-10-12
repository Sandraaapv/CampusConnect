package com.campusconnect.dto;

import com.campusconnect.model.FeePayment;
import com.campusconnect.model.FeeStructure;

import java.util.List;

public class FeeStatusSummaryDto {
    private int semester;
    private double totalFee;
    private double paid;
    private double balanceDue;
    private String dueDate;
    private String status;
    private String paymentPortalUrl;
    private List<FeeStructure> breakdown;
    private List<FeePayment> payments;

    public FeeStatusSummaryDto() {}

    public FeeStatusSummaryDto(int semester, double totalFee, double paid, double balanceDue, String dueDate, String status, String paymentPortalUrl, List<FeeStructure> breakdown, List<FeePayment> payments) {
        this.semester = semester;
        this.totalFee = totalFee;
        this.paid = paid;
        this.balanceDue = balanceDue;
        this.dueDate = dueDate;
        this.status = status;
        this.paymentPortalUrl = paymentPortalUrl;
        this.breakdown = breakdown;
        this.payments = payments;
    }

    public int getSemester() { return semester; }
    public void setSemester(int semester) { this.semester = semester; }
    public double getTotalFee() { return totalFee; }
    public void setTotalFee(double totalFee) { this.totalFee = totalFee; }
    public double getPaid() { return paid; }
    public void setPaid(double paid) { this.paid = paid; }
    public double getBalanceDue() { return balanceDue; }
    public void setBalanceDue(double balanceDue) { this.balanceDue = balanceDue; }
    public String getDueDate() { return dueDate; }
    public void setDueDate(String dueDate) { this.dueDate = dueDate; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getPaymentPortalUrl() { return paymentPortalUrl; }
    public void setPaymentPortalUrl(String paymentPortalUrl) { this.paymentPortalUrl = paymentPortalUrl; }
    public List<FeeStructure> getBreakdown() { return breakdown; }
    public void setBreakdown(List<FeeStructure> breakdown) { this.breakdown = breakdown; }
    public List<FeePayment> getPayments() { return payments; }
    public void setPayments(List<FeePayment> payments) { this.payments = payments; }
}
