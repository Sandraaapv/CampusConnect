package com.campusconnect.model;

import jakarta.persistence.*;

@Entity
@Table(name = "faculty")
public class Faculty {

    @Id
    @Column(name = "id", length = 64)
    private String id;

    @Column(name = "name", nullable = false, length = 128)
    private String name;

    @Column(name = "designation", nullable = false, length = 128)
    private String designation;

    @Column(name = "department", nullable = false, length = 128)
    private String department;

    @Column(name = "email", nullable = false, length = 128)
    private String email;

    @Column(name = "cabin", nullable = false, length = 64)
    private String cabin;

    @Column(name = "specializations_json", columnDefinition = "TEXT")
    private String specializationsJson;

    @Column(name = "bio", columnDefinition = "TEXT")
    private String bio;

    public Faculty() {}

    public Faculty(String id, String name, String designation, String department, String email, String cabin, String specializationsJson, String bio) {
        this.id = id;
        this.name = name;
        this.designation = designation;
        this.department = department;
        this.email = email;
        this.cabin = cabin;
        this.specializationsJson = specializationsJson;
        this.bio = bio;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDesignation() { return designation; }
    public void setDesignation(String designation) { this.designation = designation; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getCabin() { return cabin; }
    public void setCabin(String cabin) { this.cabin = cabin; }

    public String getSpecializationsJson() { return specializationsJson; }
    public void setSpecializationsJson(String specializationsJson) { this.specializationsJson = specializationsJson; }

    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }
}
