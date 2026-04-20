package com.example.dmsserver.dto;

import jakarta.validation.constraints.NotBlank;

public class CreateDocumentRequest {

    @NotBlank(message = "Title must not be blank")
    private String title;

    public String getTitle() { return title; }

    public void setTitle(String title) { this.title = title; }
}
