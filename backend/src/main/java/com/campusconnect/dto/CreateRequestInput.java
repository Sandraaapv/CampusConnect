package com.campusconnect.dto;

import jakarta.validation.constraints.NotBlank;
import java.util.Map;

public class CreateRequestInput {

    @NotBlank(message = "Request type is required")
    private String type;

    @NotBlank(message = "Title is required")
    private String title;

    private Map<String, Object> details;

    public CreateRequestInput() {}

    public CreateRequestInput(String type, String title, Map<String, Object> details) {
        this.type = type;
        this.title = title;
        this.details = details;
    }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public Map<String, Object> getDetails() { return details; }
    public void setDetails(Map<String, Object> details) { this.details = details; }
}
