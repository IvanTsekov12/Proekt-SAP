package com.example.dmsserver.service;

import com.example.dmsserver.exception.BadRequestException;
import com.example.dmsserver.exception.NotFoundException;
import com.example.dmsserver.model.Document;
import com.example.dmsserver.model.Role;
import com.example.dmsserver.model.User;
import com.example.dmsserver.model.Version;
import com.example.dmsserver.model.VersionStatus;
import com.example.dmsserver.repository.DocumentRepository;
import com.example.dmsserver.repository.UserRepository;
import com.example.dmsserver.repository.VersionRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.TestingAuthenticationToken;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DocumentServiceTest {

    @Mock
    private DocumentRepository documentRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private VersionRepository versionRepository;

    @InjectMocks
    private DocumentService documentService;

    @AfterEach
    void cleanup() {
        SecurityContextHolder.clearContext();
    }

    // Proverqva che createDocument zapisva dokument za lognatiq user.
    @Test
    void createDocument_shouldSaveDocumentForAuthenticatedUser() {
        authenticateAs("author");

        User author = user("author", Role.AUTHOR);
        when(userRepository.findByUsername("author")).thenReturn(Optional.of(author));
        when(documentRepository.save(any(Document.class))).thenAnswer(inv -> inv.getArgument(0));

        Document result = documentService.createDocument("Doc A");

        assertNotNull(result);
        assertEquals("Doc A", result.getTitle());
        assertEquals("author", result.getAuthor().getUsername());
        verify(documentRepository).save(any(Document.class));
    }

    // Proverqva che createDocument hvurlq NotFoundException, kogato user lipсva.
    @Test
    void createDocument_shouldThrowWhenUserNotFound() {
        authenticateAs("ghost");
        when(userRepository.findByUsername("ghost")).thenReturn(Optional.empty());

        assertThrows(NotFoundException.class, () -> documentService.createDocument("Doc"));
        verify(documentRepository, never()).save(any());
    }

    // Proverqva che getAllDocuments vrushta tova, koeto repo-to vrushta.
    @Test
    void getAllDocuments_shouldReturnRepositoryResult() {
        User author = user("author", Role.AUTHOR);
        Document d1 = new Document("D1", author);
        Document d2 = new Document("D2", author);

        when(documentRepository.findAll()).thenReturn(List.of(d1, d2));

        List<Document> result = documentService.getAllDocuments();

        assertEquals(2, result.size());
        verify(documentRepository).findAll();
    }

    // Proverqva che getDocumentOrThrow vrushta dokument, kogato su6testvuva.
    @Test
    void getDocumentOrThrow_shouldReturnDocumentWhenFound() {
        UUID id = UUID.randomUUID();
        Document doc = new Document("Found", user("author", Role.AUTHOR));

        when(documentRepository.findById(id)).thenReturn(Optional.of(doc));

        Document result = documentService.getDocumentOrThrow(id);

        assertEquals("Found", result.getTitle());
    }

    // Proverqva che getDocumentOrThrow hvurlq NotFoundException pri lipsva6 dokument.
    @Test
    void getDocumentOrThrow_shouldThrowWhenNotFound() {
        UUID id = UUID.randomUUID();
        when(documentRepository.findById(id)).thenReturn(Optional.empty());

        assertThrows(NotFoundException.class, () -> documentService.getDocumentOrThrow(id));
    }

    // Proverqva che createVersion pravi sledvasht nomer versiq i setva createdBy.
    @Test
    void createVersion_shouldCreateNextVersionAndSetCreatedBy() {
        UUID docId = UUID.randomUUID();
        authenticateAs("author");

        User author = user("author", Role.AUTHOR);
        Document doc = new Document("Doc", author);

        Version v1 = new Version(1, "old");
        Version v3 = new Version(3, "older");
        doc.getVersions().add(v1);
        doc.getVersions().add(v3);

        when(documentRepository.findById(docId)).thenReturn(Optional.of(doc));
        when(userRepository.findByUsername("author")).thenReturn(Optional.of(author));
        when(documentRepository.save(any(Document.class))).thenAnswer(inv -> inv.getArgument(0));

        Version created = documentService.createVersion(docId, "new content");

        assertEquals(4, created.getVersionNumber());
        assertEquals(VersionStatus.DRAFT, created.getStatus());
        assertSame(author, created.getCreatedBy());
        assertSame(doc, ReflectionTestUtils.getField(created, "document"));
        assertTrue(doc.getVersions().contains(created));
        verify(documentRepository).save(doc);
    }

    // Proverqva che createVersion hvurlq NotFoundException pri lipsvasht dokument.
    @Test
    void createVersion_shouldThrowWhenDocumentNotFound() {
        UUID docId = UUID.randomUUID();
        when(documentRepository.findById(docId)).thenReturn(Optional.empty());

        assertThrows(NotFoundException.class, () -> documentService.createVersion(docId, "x"));
    }

    // Proverqva che approveVersion promenq status na APPROVED i setva approver + approvedAt.
    @Test
    void approveVersion_shouldApproveAndSetApproverAndApprovedAt() {
        UUID versionId = UUID.randomUUID();
        authenticateAs("reviewer");

        Version version = new Version(1, "content");
        setId(version, versionId);
        version.setStatus(VersionStatus.IN_REVIEW);

        User reviewer = user("reviewer", Role.REVIEWER);

        when(versionRepository.findById(versionId)).thenReturn(Optional.of(version));
        when(userRepository.findByUsername("reviewer")).thenReturn(Optional.of(reviewer));
        when(versionRepository.save(any(Version.class))).thenAnswer(inv -> inv.getArgument(0));

        Version result = documentService.approveVersion(versionId, "ok");

        assertEquals(VersionStatus.APPROVED, result.getStatus());
        assertSame(reviewer, result.getApprovedBy());
        assertNotNull(ReflectionTestUtils.getField(result, "approvedAt"));
        verify(versionRepository).save(version);
    }

    // Proverqva che approveVersion e validen samo za IN_REVIEW.
    @Test
    void approveVersion_shouldThrowWhenVersionNotInReview() {
        UUID versionId = UUID.randomUUID();
        Version version = new Version(1, "content");
        setId(version, versionId);
        version.setStatus(VersionStatus.DRAFT);

        when(versionRepository.findById(versionId)).thenReturn(Optional.of(version));

        assertThrows(BadRequestException.class, () -> documentService.approveVersion(versionId, null));
        verify(versionRepository, never()).save(any());
    }

    // Proverqva che rejectVersion promenq status na REJECTED, kogato versiqta e IN_REVIEW.
    @Test
    void rejectVersion_shouldRejectWhenInReview() {
        UUID versionId = UUID.randomUUID();
        Version version = new Version(1, "content");
        setId(version, versionId);
        version.setStatus(VersionStatus.IN_REVIEW);

        when(versionRepository.findById(versionId)).thenReturn(Optional.of(version));
        when(versionRepository.save(any(Version.class))).thenAnswer(inv -> inv.getArgument(0));

        Version result = documentService.rejectVersion(versionId, "not good");

        assertEquals(VersionStatus.REJECTED, result.getStatus());
        verify(versionRepository).save(version);
    }

    // Proverqva che activateVersion pravi izbranata versiq ACTIVE i vrushta starata ACTIVE kum APPROVED.
    @Test
    void activateVersion_shouldSetNewActiveAndOldActiveBackToApproved() {
        UUID docId = UUID.randomUUID();
        UUID oldActiveId = UUID.randomUUID();
        UUID newActiveId = UUID.randomUUID();

        User author = user("author", Role.AUTHOR);
        Document doc = new Document("Doc", author);

        Version oldActive = new Version(1, "v1");
        setId(oldActive, oldActiveId);
        oldActive.setStatus(VersionStatus.ACTIVE);

        Version approved = new Version(2, "v2");
        setId(approved, newActiveId);
        approved.setStatus(VersionStatus.APPROVED);

        doc.getVersions().add(oldActive);
        doc.getVersions().add(approved);

        when(documentRepository.findById(docId)).thenReturn(Optional.of(doc));
        when(documentRepository.save(any(Document.class))).thenAnswer(inv -> inv.getArgument(0));

        Version result = documentService.activateVersion(docId, newActiveId);

        assertEquals(VersionStatus.ACTIVE, result.getStatus());
        assertEquals(VersionStatus.APPROVED, oldActive.getStatus());
        verify(documentRepository).save(doc);
    }

    // Proverqva che getActiveVersion vrushta aktivnata versiq.
    @Test
    void getActiveVersion_shouldReturnActiveVersion() {
        UUID docId = UUID.randomUUID();
        Document doc = new Document("Doc", user("author", Role.AUTHOR));

        Version active = new Version(1, "active");
        active.setStatus(VersionStatus.ACTIVE);
        doc.getVersions().add(active);

        when(documentRepository.findById(docId)).thenReturn(Optional.of(doc));

        Version result = documentService.getActiveVersion(docId);

        assertSame(active, result);
    }

    // Proverqva che getActiveVersion hvurlq NotFoundException, ako nqma ACTIVE versiq.
    @Test
    void getActiveVersion_shouldThrowWhenNoActiveVersion() {
        UUID docId = UUID.randomUUID();
        Document doc = new Document("Doc", user("author", Role.AUTHOR));

        Version draft = new Version(1, "draft");
        draft.setStatus(VersionStatus.DRAFT);
        doc.getVersions().add(draft);

        when(documentRepository.findById(docId)).thenReturn(Optional.of(doc));

        assertThrows(NotFoundException.class, () -> documentService.getActiveVersion(docId));
    }

    // Proverqva che submitForReview premestva DRAFT -> IN_REVIEW.
    @Test
    void submitForReview_shouldMoveDraftToInReview() {
        UUID versionId = UUID.randomUUID();
        Version draft = new Version(1, "content");
        setId(draft, versionId);

        when(versionRepository.findById(versionId)).thenReturn(Optional.of(draft));
        when(versionRepository.save(any(Version.class))).thenAnswer(inv -> inv.getArgument(0));

        Version result = documentService.submitForReview(versionId);

        assertEquals(VersionStatus.IN_REVIEW, result.getStatus());
        verify(versionRepository).save(draft);
    }

    // Proverqva che submitForReview hvurlq BadRequestException, ako status ne e DRAFT.
    @Test
    void submitForReview_shouldThrowWhenNotDraft() {
        UUID versionId = UUID.randomUUID();
        Version version = new Version(1, "content");
        setId(version, versionId);
        version.setStatus(VersionStatus.APPROVED);

        when(versionRepository.findById(versionId)).thenReturn(Optional.of(version));

        assertThrows(BadRequestException.class, () -> documentService.submitForReview(versionId));
        verify(versionRepository, never()).save(any());
    }

    // Proverqva che deleteDocument trii dokument, kogato e nameren.
    @Test
    void deleteDocument_shouldDeleteWhenFound() {
        UUID docId = UUID.randomUUID();
        Document doc = new Document("Doc", user("author", Role.AUTHOR));

        when(documentRepository.findById(docId)).thenReturn(Optional.of(doc));

        documentService.deleteDocument(docId);

        verify(documentRepository).delete(doc);
    }

    // Proverqva che deleteDocument hvurlq NotFoundException pri lipsva6 dokument.
    @Test
    void deleteDocument_shouldThrowWhenMissing() {
        UUID docId = UUID.randomUUID();
        when(documentRepository.findById(docId)).thenReturn(Optional.empty());

        assertThrows(NotFoundException.class, () -> documentService.deleteDocument(docId));
        verify(documentRepository, never()).delete(any());
    }

    // Proverqva che createVersion hvurlq NotFoundException, kogato lognatiq user ne e v bazata.
    @Test
    void createVersion_shouldThrowWhenUserNotFound() {
        UUID docId = UUID.randomUUID();
        authenticateAs("missing-user");

        Document doc = new Document("Doc", user("author", Role.AUTHOR));
        when(documentRepository.findById(docId)).thenReturn(Optional.of(doc));
        when(userRepository.findByUsername("missing-user")).thenReturn(Optional.empty());

        assertThrows(NotFoundException.class, () -> documentService.createVersion(docId, "x"));
        verify(documentRepository, never()).save(any());
    }

    // Proverqva che getVersions vrushta vsichki versii na dokumenta.
    @Test
    void getVersions_shouldReturnAllVersions() {
        UUID docId = UUID.randomUUID();

        Document doc = new Document("Doc", user("author", Role.AUTHOR));
        Version v1 = new Version(1, "v1");
        Version v2 = new Version(2, "v2");
        doc.getVersions().add(v1);
        doc.getVersions().add(v2);

        when(documentRepository.findById(docId)).thenReturn(Optional.of(doc));

        var result = documentService.getVersions(docId);

        assertEquals(2, result.size());
        assertSame(v1, result.get(0));
        assertSame(v2, result.get(1));
    }

    // Proverqva che getVersions hvurlq RuntimeException pri lipsvasht dokument.
    @Test
    void getVersions_shouldThrowRuntimeWhenDocumentMissing() {
        UUID docId = UUID.randomUUID();
        when(documentRepository.findById(docId)).thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(RuntimeException.class, () -> documentService.getVersions(docId));
        assertEquals("Document not found", ex.getMessage());
    }

    // Proverqva che approveVersion hvurlq NotFoundException pri lipsvashta versiq.
    @Test
    void approveVersion_shouldThrowWhenVersionNotFound() {
        UUID versionId = UUID.randomUUID();
        when(versionRepository.findById(versionId)).thenReturn(Optional.empty());

        assertThrows(NotFoundException.class, () -> documentService.approveVersion(versionId, "ok"));
    }

    // Proverqva che approveVersion hvurlq NotFoundException, ako reviewer user ne e nameren.
    @Test
    void approveVersion_shouldThrowWhenApproverNotFound() {
        UUID versionId = UUID.randomUUID();
        authenticateAs("reviewer");

        Version version = new Version(1, "content");
        setId(version, versionId);
        version.setStatus(VersionStatus.IN_REVIEW);

        when(versionRepository.findById(versionId)).thenReturn(Optional.of(version));
        when(userRepository.findByUsername("reviewer")).thenReturn(Optional.empty());

        assertThrows(NotFoundException.class, () -> documentService.approveVersion(versionId, "ok"));
        verify(versionRepository, never()).save(any());
    }

    // Proverqva che rejectVersion e validen samo pri IN_REVIEW status.
    @Test
    void rejectVersion_shouldThrowWhenStatusIsNotInReview() {
        UUID versionId = UUID.randomUUID();
        Version version = new Version(1, "content");
        setId(version, versionId);
        version.setStatus(VersionStatus.DRAFT);

        when(versionRepository.findById(versionId)).thenReturn(Optional.of(version));

        assertThrows(BadRequestException.class, () -> documentService.rejectVersion(versionId, "no"));
        verify(versionRepository, never()).save(any());
    }

    // Proverqva che activateVersion hvurlq NotFoundException, ako target versiqta ne e v dokumenta.
    @Test
    void activateVersion_shouldThrowWhenTargetVersionNotFoundInDocument() {
        UUID docId = UUID.randomUUID();
        UUID missingVersionId = UUID.randomUUID();

        Document doc = new Document("Doc", user("author", Role.AUTHOR));
        Version existing = new Version(1, "v1");
        setId(existing, UUID.randomUUID());
        existing.setStatus(VersionStatus.APPROVED);
        doc.getVersions().add(existing);

        when(documentRepository.findById(docId)).thenReturn(Optional.of(doc));

        assertThrows(NotFoundException.class, () -> documentService.activateVersion(docId, missingVersionId));
        verify(documentRepository, never()).save(any());
    }

    // Proverqva che activateVersion hvurlq BadRequestException, ako target versiqta ne e APPROVED.
    @Test
    void activateVersion_shouldThrowWhenTargetVersionNotApproved() {
        UUID docId = UUID.randomUUID();
        UUID versionId = UUID.randomUUID();

        Document doc = new Document("Doc", user("author", Role.AUTHOR));
        Version target = new Version(1, "v1");
        setId(target, versionId);
        target.setStatus(VersionStatus.DRAFT);
        doc.getVersions().add(target);

        when(documentRepository.findById(docId)).thenReturn(Optional.of(doc));

        assertThrows(BadRequestException.class, () -> documentService.activateVersion(docId, versionId));
        verify(documentRepository, never()).save(any());
    }

    // Proverqva che submitForReview hvurlq NotFoundException pri lipsvashta versiq.
    @Test
    void submitForReview_shouldThrowWhenVersionNotFound() {
        UUID versionId = UUID.randomUUID();
        when(versionRepository.findById(versionId)).thenReturn(Optional.empty());

        assertThrows(NotFoundException.class, () -> documentService.submitForReview(versionId));
    }

    // Proverqva che rejectVersion hvurlq NotFoundException pri lipsvashta versiq.
    @Test
    void rejectVersion_shouldThrowWhenVersionNotFound() {
        UUID versionId = UUID.randomUUID();
        when(versionRepository.findById(versionId)).thenReturn(Optional.empty());

        assertThrows(NotFoundException.class, () -> documentService.rejectVersion(versionId, "x"));
    }

    private void authenticateAs(String username) {
        SecurityContext context = SecurityContextHolder.createEmptyContext();
        context.setAuthentication(new TestingAuthenticationToken(username, null));
        SecurityContextHolder.setContext(context);
    }

    private User user(String username, Role role) {
        return new User(UUID.randomUUID(), username, "encoded", role);
    }

    private void setId(Object target, UUID id) {
        ReflectionTestUtils.setField(target, "id", id);
    }
}
