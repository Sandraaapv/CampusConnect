package com.campusconnect.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "student_records", indexes = {
    @Index(name = "idx_student_regno", columnList = "register_number"),
    @Index(name = "idx_student_email", columnList = "email")
})
public class StudentRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "register_number", nullable = false, unique = true, length = 32)
    private String registerNumber;

    @Column(name = "email", nullable = false, unique = true, length = 128)
    private String email;

    @Column(name = "name", nullable = false, length = 128)
    private String name;

    @Column(name = "department", nullable = false, length = 128)
    private String department;

    @Column(name = "semester", nullable = false)
    private Integer semester;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public StudentRecord() {}

    public StudentRecord(String registerNumber, String email, String name, String department, Integer semester) {
        this.registerNumber = registerNumber;
        this.email = email;
        this.name = name;
        this.department = department;
        this.semester = semester;
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getRegisterNumber() { return registerNumber; }
    public void setRegisterNumber(String registerNumber) { this.registerNumber = registerNumber; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public Integer getSemester() { return semester; }
    public void setSemester(Integer semester) { this.semester = semester; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
