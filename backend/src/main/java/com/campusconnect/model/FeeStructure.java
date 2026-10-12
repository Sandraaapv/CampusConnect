package com.campusconnect.model;

import jakarta.persistence.*;

@Entity
@Table(name = "fee_structures")
public class FeeStructure {

    @Id
    @Column(name = "id", length = 64)
    private String id;

    @Column(name = "semester", nullable = false)
    private int semester;

    @Column(name = "component", nullable = false, length = 128)
    private String component;

    @Column(name = "amount", nullable = false)
    private double amount;

    public FeeStructure() {}

    public FeeStructure(String id, int semester, String component, double amount) {
        this.id = id;
        this.semester = semester;
        this.component = component;
        this.amount = amount;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public int getSemester() { return semester; }
    public void setSemester(int semester) { this.semester = semester; }

    public String getComponent() { return component; }
    public void setComponent(String component) { this.component = component; }

    public double getAmount() { return amount; }
    public void setAmount(double amount) { this.amount = amount; }
}
