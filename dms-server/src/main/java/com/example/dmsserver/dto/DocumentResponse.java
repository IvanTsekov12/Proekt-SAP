package com.example.dmsserver.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public class DocumentResponse {

    private UUID id;
    private String title;
    private LocalDateTime createdAt;
    private String author;

    public DocumentResponse(UUID id, String title, LocalDateTime createdAt, String author) {
        this.id = id;
        this.title = title;
        this.createdAt = createdAt;
        this.author = author;
    }

    public UUID getId() { return id; }
    public String getTitle() { return title; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
