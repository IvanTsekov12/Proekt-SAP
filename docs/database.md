# 🗄️ Database Design

## Overview
The system is built around three main entities:

- User
- Document
- Version

The design ensures **version control and traceability**.

Note on IDs: The system uses UUIDs (Universally Unique Identifiers) stored as BINARY(16)   
for primary keys. This ensures better scalability and security compared to standard   
auto-incrementing integers.

---

## Entities

### User
Represents system users.

Attributes:
- id, BINARY, PK
- username, VARCHAR
- password, VARCHAR
- role, VARCHAR

---

### Document
Represents a logical document.

Attributes:
- id, BINARY, PK
- title, VARCHAR
- created_at, DATETIME
- author_id, BINARY, FK

Relationships:
- Created by a User
- Has one active Version

---

### Version
Represents a specific version of a document.

Attributes:
- id, BINARY, PK
- content, TEXT
- version_number, INT
- status, VARCHAR
- created_at, DATETIME
- created_by, BINARY, FK
- document_id, BINARY, FK
- approved_by, BINARY, FK
- approved_at, DATETIME

Relationships:
- Belongs to a Document
- Created by a User
- Approved by a User

---

## Relationships

- User ↔ Document (1:N)
  - Relationship: One user can be the author of many documents
  - Foreign Key: document.author_id references users.id 
  - Type: One-to-Many

- Document ↔ Version (1:N)
  - Relationship: One document can have multiple historical versions,   
  but each version belongs to exactly one document
  - Foreign Key: version.document_id references document.id
  - Type: One-to-Many 

- User ↔ Version (1:N)
  - Relationship: One user can create or approve many versions.
  - Foreign Keys: version.created_by references users.id  
  version.approved_by (nullable) references users.id
  - Type: One-to-Many.

---

📎 [ER Diagram](diagrams/er_diagram.drawio.png)

---

#### VersionStatus (Enumerated)
- `DRAFT`: Initial state, visible only to author.
- `IN_REVIEW`: Submitted for approval.
- `APPROVED`: The official active version.
- `REJECTED`: Version requires changes.
- `ACTIVE`: Version is active

---

## Key Design Idea

Instead of editing documents directly:
➡️ Every change creates a **new version**

This ensures:
- Full history tracking
- No data loss
- Auditability

---

## Version Workflow

1. User creates version
2. Version status = `IN_REVIEW`
3. Reviewer approves/rejects
4. If approved → becomes active version

---

## Why This Design?

- Supports version control
- Enables approval workflow
- Keeps historical data immutable
