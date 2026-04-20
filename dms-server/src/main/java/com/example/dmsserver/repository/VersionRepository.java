package com.example.dmsserver.repository;

import com.example.dmsserver.model.Document;
import com.example.dmsserver.model.Version;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface VersionRepository extends JpaRepository<Version, UUID> {

    List<Version> findByDocumentIdOrderByVersionNumberDesc(UUID documentId);
}
