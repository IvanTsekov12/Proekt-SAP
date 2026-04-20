package com.example.dmsserver.repository;

import com.example.dmsserver.model.Document;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface DocumentRepository extends JpaRepository<Document, UUID> {
    List<Document> findByAuthorUsername(String username);
}
