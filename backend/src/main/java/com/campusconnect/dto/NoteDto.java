package com.campusconnect.dto;

import java.util.List;

public class NoteDto {
    private String id;
    private String subjectId;
    private String subjectCode;
    private String title;
    private String fileType;
    private String uploadedBy;
    private String uploadedDate;
    private int upvotes;
    private List<String> upvotedBy;

    public NoteDto() {}

    public NoteDto(String id, String subjectId, String subjectCode, String title,
                   String fileType, String uploadedBy, String uploadedDate,
                   int upvotes, List<String> upvotedBy) {
        this.id = id;
        this.subjectId = subjectId;
        this.subjectCode = subjectCode;
        this.title = title;
        this.fileType = fileType;
        this.uploadedBy = uploadedBy;
        this.uploadedDate = uploadedDate;
        this.upvotes = upvotes;
        this.upvotedBy = upvotedBy;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getSubjectId() { return subjectId; }
    public void setSubjectId(String subjectId) { this.subjectId = subjectId; }

    public String getSubjectCode() { return subjectCode; }
    public void setSubjectCode(String subjectCode) { this.subjectCode = subjectCode; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getFileType() { return fileType; }
    public void setFileType(String fileType) { this.fileType = fileType; }

    public String getUploadedBy() { return uploadedBy; }
    public void setUploadedBy(String uploadedBy) { this.uploadedBy = uploadedBy; }

    public String getUploadedDate() { return uploadedDate; }
    public void setUploadedDate(String uploadedDate) { this.uploadedDate = uploadedDate; }

    public int getUpvotes() { return upvotes; }
    public void setUpvotes(int upvotes) { this.upvotes = upvotes; }

    public List<String> getUpvotedBy() { return upvotedBy; }
    public void setUpvotedBy(List<String> upvotedBy) { this.upvotedBy = upvotedBy; }
}
