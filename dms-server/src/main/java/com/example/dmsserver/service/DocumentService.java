package com.example.dmsserver.service;

import org.springframework.transaction.annotation.Transactional;
import com.example.dmsserver.exception.BadRequestException;
import com.example.dmsserver.exception.NotFoundException;
import com.example.dmsserver.model.Document;
import com.example.dmsserver.model.User;
import com.example.dmsserver.model.Version;
import com.example.dmsserver.model.VersionStatus;
import com.example.dmsserver.repository.DocumentRepository;
import com.example.dmsserver.repository.UserRepository;
import com.example.dmsserver.repository.VersionRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;


import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class DocumentService {

    private final DocumentRepository documentRepository;
    private final UserRepository userRepository;
    private final VersionRepository versionRepository;

    public DocumentService(DocumentRepository documentRepository, UserRepository userRepository, VersionRepository versionRepository) {
        this.documentRepository = documentRepository;
        this.userRepository = userRepository;
        this.versionRepository = versionRepository;
    }

    public Document createDocument(String title) {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new NotFoundException("User not found"));

        Document document = new Document(title, user);

        return documentRepository.save(document);
    }

    public List<Document> getAllDocuments() {
        return documentRepository.findAll();
    }

    public Document getDocumentOrThrow(UUID id) {
        return documentRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Document not found"));
    }

    @Transactional
    public Version createVersion(UUID documentId, String content) {

        Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> new NotFoundException("Document not found"));

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new NotFoundException("User not found"));

        int nextVersionNumber = document.getVersions().stream()
                .mapToInt(Version::getVersionNumber)
                .max()
                .orElse(0) + 1;

        Version version = new Version(nextVersionNumber, content);

        version.setDocument(document);
        version.setCreatedBy(user);

        document.getVersions().add(version);

        documentRepository.save(document);

        return version;
    }

    @Transactional(readOnly = true)
    public List<Version> getVersions(UUID documentId) {
        Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> new RuntimeException("Document not found"));

        return document.getVersions();
    }

    public Version approveVersion(UUID versionId, String comment) {

        Version version = versionRepository.findById(versionId)
                .orElseThrow(() -> new NotFoundException("Version not found"));

        if (version.getStatus() != VersionStatus.IN_REVIEW) {
            throw new BadRequestException("Only versions in review can be approved");
        }

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();

        User approver = userRepository.findByUsername(username)
                .orElseThrow(() -> new NotFoundException("User not found"));

        version.setStatus(VersionStatus.APPROVED);
        version.setApprovedBy(approver);
        version.setApprovedAt(LocalDateTime.now());

        if (comment != null && !comment.isEmpty()) {
            System.out.println("APPROVE - Version " + versionId + " by " + username + " - Comment: " + comment);
        }

        return versionRepository.save(version);
    }

    public Version rejectVersion(UUID versionId, String comment) {

        Version version = versionRepository.findById(versionId)
                .orElseThrow(() -> new NotFoundException("Version not found"));

        if (version.getStatus() != VersionStatus.IN_REVIEW) {
            throw new BadRequestException("Only versions in review can be rejected");
        }

        version.setStatus(VersionStatus.REJECTED);

        if (comment != null && !comment.isEmpty()) {
            System.out.println("REJECT - Version " + versionId + " - Comment: " + comment);
        }

        return versionRepository.save(version);
    }

    public Version activateVersion(UUID documentId, UUID versionId) {

        Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> new NotFoundException("Document not found"));

        Version versionToActivate = document.getVersions().stream()
                .filter(v -> v.getId().equals(versionId))
                .findFirst()
                .orElseThrow(() -> new NotFoundException("Version not found"));

        if (versionToActivate.getStatus() != VersionStatus.APPROVED) {
            throw new BadRequestException("Only APPROVED versions can be activated");
        }

        document.getVersions().forEach(v -> {
            if (v.getStatus() == VersionStatus.ACTIVE) {
                v.setStatus(VersionStatus.APPROVED);
            }
        });

        versionToActivate.setStatus(VersionStatus.ACTIVE);

        documentRepository.save(document);
        return versionToActivate;
    }

    public Version getActiveVersion(UUID documentId) {
        Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> new NotFoundException("Document not found"));

        return document.getVersions().stream()
                .filter(v -> v.getStatus() == VersionStatus.ACTIVE)
                .findFirst()
                .orElseThrow(() -> new NotFoundException("No ACTIVE version for this document"));
    }

    public Version submitForReview(UUID versionId) {
        Version version = versionRepository.findById(versionId)
                .orElseThrow(() -> new NotFoundException("Version not found"));

        if (version.getStatus() != VersionStatus.DRAFT) {
            throw new BadRequestException("Only DRAFT versions can be submitted for review");
        }

        version.setStatus(VersionStatus.IN_REVIEW);

        return versionRepository.save(version);
    }

    public void deleteDocument(UUID documentId) {
        Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> new NotFoundException("Document not found"));
        documentRepository.delete(document);
    }
}