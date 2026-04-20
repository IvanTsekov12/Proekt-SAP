package com.example.dmsserver.model;

import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import com.fasterxml.jackson.annotation.JsonIgnore;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "version")
public class Version {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @JdbcTypeCode(SqlTypes.BINARY)
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @Column(name = "version_number", nullable = false)
    private int versionNumber;

    @Column(name = "content", columnDefinition = "TEXT")
    private String content;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private VersionStatus status;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @ManyToOne
    @JoinColumn(name = "document_id")
    @JsonIgnore
    private Document document;

    @ManyToOne
    @JoinColumn(name = "created_by", nullable = false)
    private User createdBy;

    @ManyToOne
    @JoinColumn(name = "approved_by")
    private User approvedBy;

    @Column(name = "approved_at")
    private LocalDateTime approvedAt;

    public Version() {}

    public Version(int versionNumber, String content) {
        this.versionNumber = versionNumber;
        this.content = content;
        this.status = VersionStatus.DRAFT;
        this.createdAt = LocalDateTime.now();
    }

    public Version(String content, Document document) {
        this.content = content;
        this.document = document;
        this.status = VersionStatus.DRAFT;
        this.createdAt = LocalDateTime.now();
    }

    public UUID getId() { return id; }
    public int getVersionNumber() { return versionNumber; }
    public String getContent() { return content; }
    public VersionStatus getStatus() { return status; }
    public User getCreatedBy() { return createdBy; }
    public User getApprovedBy() { return approvedBy; }
    public LocalDateTime getCreatedAt() { return createdAt; }

    public void setStatus(VersionStatus status) { this.status = status; }
    public void setDocument(Document document) { this.document = document; }
    public void setCreatedBy(User createdBy) { this.createdBy = createdBy; }
    public void setApprovedBy(User approvedBy) { this.approvedBy = approvedBy; }
    public void setApprovedAt(LocalDateTime approvedAt) { this.approvedAt = approvedAt; }

    public void approve() { this.status = VersionStatus.APPROVED; }
    public void reject() { this.status = VersionStatus.REJECTED; }
}