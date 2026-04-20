package com.example.dmsserver.controller;

import com.example.dmsserver.dto.*;
import com.example.dmsserver.model.Document;
import com.example.dmsserver.model.Version;
import com.example.dmsserver.service.DocumentService;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/documents")
public class DocumentController {

    private final DocumentService documentService;

    public DocumentController(DocumentService documentService) {
        this.documentService = documentService;
    }

    @PreAuthorize("hasRole('AUTHOR') or hasRole('ADMIN')")
    @PostMapping
    public DocumentResponse createDocument(@RequestBody CreateDocumentRequest request) {
        Document doc = documentService.createDocument(request.getTitle());
        return mapToDocumentResponse(doc);
    }

    @PreAuthorize("hasAnyRole('AUTHOR','REVIEWER','READER','ADMIN')")
    @GetMapping
    public List<DocumentResponse> getAllDocuments() {
        return documentService.getAllDocuments()
                .stream()
                .map(this::mapToDocumentResponse)
                .toList();

    }

    @PreAuthorize("hasRole('AUTHOR') or hasRole('ADMIN')")
    @PostMapping("/{documentId}/versions")
    public VersionResponse createVersion(@PathVariable UUID documentId, @RequestBody @Valid CreateVersionRequest request) {
        Version version = documentService.createVersion(documentId, request.getContent());
        return mapToVersionResponse(version);
    }

    @PostMapping("/versions/{versionId}/approve")
    @PreAuthorize("hasRole('REVIEWER') or hasRole('ADMIN')")
    public VersionResponse approveVersion(
            @PathVariable UUID versionId,
            @RequestBody(required = false) ReviewRequest request) {

        String comment = (request != null) ? request.getComment() : null;
        Version version = documentService.approveVersion(versionId, comment);
        return mapToVersionResponse(version);
    }

    @PreAuthorize("hasAnyRole('AUTHOR','REVIEWER','READER','ADMIN')")
    @GetMapping("/{documentId}/versions")
    public List<VersionResponse> getVersions(@PathVariable UUID documentId) {
        return documentService.getVersions(documentId)
                .stream()
                .map(this::mapToVersionResponse)
                .toList();
    }

    @PostMapping("/versions/{versionId}/reject")
    @PreAuthorize("hasRole('REVIEWER') or hasRole('ADMIN')")
    public VersionResponse rejectVersion(
            @PathVariable UUID versionId,
            @RequestBody(required = false) ReviewRequest request) {

        String comment = (request != null) ? request.getComment() : null;
        Version version = documentService.rejectVersion(versionId, comment);
        return mapToVersionResponse(version);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/{documentId}/versions/{versionId}/activate")
    public VersionResponse activateVersion(@PathVariable UUID documentId, @PathVariable UUID versionId) {
        Version version = documentService.activateVersion(documentId, versionId);
        return mapToVersionResponse(version);
    }

    private DocumentResponse mapToDocumentResponse(Document document) {
        return new DocumentResponse(
                document.getId(),
                document.getTitle(),
                document.getCreatedAt(),
                document.getAuthor().getUsername()
        );
    }

    private VersionResponse mapToVersionResponse(Version version) {
        String createdBy = version.getCreatedBy() != null
                ? version.getCreatedBy().getUsername() : "Unknown";

        return new VersionResponse(
                version.getId(),
                version.getVersionNumber(),
                version.getContent(),
                version.getStatus().name(),
                createdBy,
                version.getCreatedAt()
        );
    }

    @PreAuthorize("hasAnyRole('AUTHOR','REVIEWER','READER','ADMIN')")
    @GetMapping("/{documentId}/active")
    public VersionResponse getActiveVersion(@PathVariable UUID documentId) {
        Version v = documentService.getActiveVersion(documentId);
        return mapToVersionResponse(v);
    }

    @PreAuthorize("hasRole('AUTHOR') or hasRole('ADMIN')")
    @PostMapping("/versions/{versionId}/submit")
    public VersionResponse submitForReview(@PathVariable UUID versionId) {
        Version version = documentService.submitForReview(versionId);

        return mapToVersionResponse(version);
    }

    @DeleteMapping("/{documentId}")
    @PreAuthorize("hasRole('ADMIN')")
    public void deleteDocument(@PathVariable UUID documentId) {
        documentService.deleteDocument(documentId);
    }
}
