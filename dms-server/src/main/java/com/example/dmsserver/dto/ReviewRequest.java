package com.example.dmsserver.dto;

public class ReviewRequest {
    private String comment;

    public ReviewRequest() {}

    public ReviewRequest(String comment) {
        this.comment = comment;
    }

    public String getComment() { return comment; }

    public void setComment(String comment) { this.comment = comment; }
}
