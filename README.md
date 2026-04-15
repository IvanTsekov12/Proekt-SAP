# 📄 Document Version Management System

The Document Version Management System is a software application designed to manage documents   
and their versions in a structured and controlled environment. The system enables users to create, edit,  
review, approve, and track different versions of documents while maintaining a complete history of changes.  
The main goal of the system is to prevent loss of information, ensure that users always access the latest  
approved version of a document, and provide transparency in the document approval process. The system  
supports multiple user roles with different access permissions, allowing authors to create and edit documents,  
reviewers to approve or reject document versions, readers to view approved documents, and administrators  
to manage users and system configuration. The application follows a client–server architecture and supports  
multiple users working with the system simultaneously.

---

## 📌 Project Objectives

The main objectives of the system are:

- To provide a centralized platform for document management.
- To maintain a structured history of document versions.
- To allow controlled approval of document versions.
- To ensure role-based access control for different users.
- To improve traceability of document modifications.
- To provide error handling and validation for invalid actions.

The system ensures that every document change is tracked and that only approved versions can become   
active and accessible to readers.

---

## 👥 System Roles
The system defines four primary user roles.

### Author
The Author is responsible for creating and editing documents and managing their versions.

Responsibilities:
- Create new documents
- Create new document versions
- Edit document drafts
- Submit document versions for review
- View document history

### Reviewer
The Reviewer is responsible for evaluating document versions and deciding whether they should  
be approved or rejected.

Responsibilities:
- Review submitted document versions
- Approve document versions
- Reject document versions
- Add comments during the review process

### Reader
The Reader has read-only access to documents.

Responsibilities:
- View active (approved) document versions
- Access published documents

### Administrator
The Administrator manages the system configuration and user access.

Responsibilities:
- Manage users
- Manage roles and permissions
- Monitor system activity
- Configure system settings

---

## 🚀 Core Functionalities

The system provides the following core functionalities.

### Document Management
- Creation of new documents
- Version Management
- Creation of new versions from the latest active version
- Storage of document metadata
- Version numbering and tracking
- Maintaining an immutable history of versions

### Approval Workflow
- Submission of document versions for review
- Review process handled by reviewers
- Approval or rejection of document versions
- Only approved versions become active
- Document History
- View complete version history of a document
- Display metadata such as author, creation date, and status
- Compare different document versions
- Role-based access control
- Prevention of unauthorized operations
- Permission validation for user actions

### Error Handling
The system must properly handle errors such as:

- Invalid user actions
- Missing data
- Unauthorized access attempts

The application should provide clear error messages to users.

---

## 📊 Diagrams
🔹 Use Case Diagram  
Describes interactions between users and the system.

📎 File:
```
docs/diagrams/use_case_diagram.png
```

🔹 ER Diagram  
Represents the database structure, entities, and relationships.

📎 File:
```
docs/diagrams/er_diagram.png
```

🔹 Architecture Diagram  
Shows the overall system structure and component interaction.

📎 File:
```
docs/diagrams/architecture_diagram.png
```

🔹 Lean Canvas   
Provides a business-oriented overview of the system idea.

📎 File:
```
docs/diagrams/lean_canvas.png
```

---

## ⚙️ Technologies
- Backend: Java / Spring Boot
- Database: MySQL
- Frontend: (to be implemented)
- Version Control: Git

---

## 🗄️ Database Design
The system includes the following main entities:
- Users
- Documents
- Versions
- Comments
- Approvals
- Audit Logs

Each document can have multiple versions, and each version goes  
through a review process before approval.