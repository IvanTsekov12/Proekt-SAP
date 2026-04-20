package com.example.dmsserver.dto;

import com.example.dmsserver.model.Version;

import java.time.Instant;
import java.util.UUID;

public class VersionDto {
    public UUID id;
    public int versionNumber;
    public String status;

    public String createdBy;
    public String approvedBy;

    public Instant createdAt;
    public Instant approvedAt;

    public VersionDto() { }

    public VersionDto(Version version) {
        this.id = version.getId();
        this.versionNumber = version.getVersionNumber();
        this.status = version.getStatus().toString();
        this.createdBy = version.getCreatedBy().getUsername();
        this.approvedBy = version.getApprovedBy().getUsername();
    }

    public String getCreatedBy() { return createdBy; }
    public String getApprovedBy() { return approvedBy; }

    public Instant getApprovedAt() { return approvedAt; }

}
