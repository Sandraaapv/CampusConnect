package com.campusconnect.model;

import jakarta.persistence.*;

@Entity
@Table(name = "notes")
public class Note {

    @Id
    @Column(name = "id", length = 64)
    private String id;

    @Column(name = "subject_id", nullable = false, length = 64)
    private String subjectId;

    @Column(name = "subject_code", nullable = false, length = 32)
    private String subjectCode;

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "file_type", nullable = false, length = 32)
    private String fileType; // PDF, Notes, PYQ

    @Column(name = "uploaded_by", nullable = false, length = 128)
    private String uploadedBy;

    @Column(name = "uploaded_date", nullable = false, length = 32)
    private String uploadedDate;

    @Column(name = "upvotes", nullable = false)
    private int upvotes = 0;

    @Lob
    @Column(name = "file_content")
    private byte[] fileContent;

    @Column(name = "file_name")
    private String fileName;

    public Note() {}

    public Note(String id, String subjectId, String subjectCode, String title, String fileType, String uploadedBy, String uploadedDate, int upvotes) {
        this.id = id;
        this.subjectId = subjectId;
        this.subjectCode = subjectCode;
        this.title = title;
        this.fileType = fileType;
        this.uploadedBy = uploadedBy;
        this.uploadedDate = uploadedDate;
        this.upvotes = upvotes;
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

    public byte[] getFileContent() { return fileContent; }
    public void setFileContent(byte[] fileContent) { this.fileContent = fileContent; }

    public String getFileName() { return fileName; }
    public void setFileName(String fileName) { this.fileName = fileName; }
}
