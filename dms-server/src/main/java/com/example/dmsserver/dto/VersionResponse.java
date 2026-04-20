package com.example.dmsserver.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public class VersionResponse {

    private UUID id;
    private int versionNumber;
    private String content;
    private String status;
    private String createdBy;
    private LocalDateTime createdAt;

    public VersionResponse(UUID id, int versionNumber, String content, String status, String createdBy, LocalDateTime createdAt) {
        this.id = id;
        this.versionNumber = versionNumber;
        this.content = content;
        this.status = status;
        this.createdBy = createdBy;
        this.createdAt = createdAt;
    }

    public UUID getId() { return id; }
    public int getVersionNumber() { return versionNumber; }
    public String getContent() { return content; }
    public String getStatus() { return status; }
    public String getCreatedBy() { return createdBy; }
    public LocalDateTime getCreatedAt() { return createdAt; }

    public void setcreatedBy(String createdBy) { this.createdBy = createdBy; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
