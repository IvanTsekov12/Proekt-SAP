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
Responsible for creating and editing documents and managing their versions.

Capabilities:
- Create new documents
- Create new document versions
- Submit document versions for review
- View document history

### Reviewer
Responsible for evaluating document versions and deciding whether they should  
be approved or rejected.

Capabilities:
- Review submitted document versions
- Approve document versions
- Reject document versions
- Add comments during the review process

### Reader
Read-only access to documents role.

Capabilities:
- View active (approved) document versions
- Access published documents

### Administrator
Manages the system configuration and user access.

Responsibilities:
- Manage users
- Manage roles and permissions
- Monitor system activity
- Configure system settings

---

## 🚀 Core Functionalities
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

### Document History
- Full version history per document
- Compare different document versions
- Metadata visibility (author, date, status)
- Version comparison capability

### Security & Access Control
- Role-based access control
- Permission validation
- Prevention of unauthorized operations

### Error Handling
The system handles errors such as:

- Invalid operations
- Missing data
- Unauthorized access attempts

---

## 📊 Diagrams
🔹 Use Case Diagram  
Describes interactions between users and the system.

📎 [Use Case Diagram](docs/diagrams/use_case_diagram.drawio.png)


🔹 ER Diagram  
Represents the database structure, entities, and relationships.

📎 [ER Diagram](docs/diagrams/er_diagram.drawio.png)

🔹 Architecture Diagram  
Shows the overall system structure and component interaction.

📎 [Architecture Diagram](docs/diagrams/architecture_diagram.drawio.png)

🔹 Lean Canvas   
Business-level overview of the project idea.

📎 [Lean Canvas](docs/diagrams/Lean_Canvas_Document_Version_System.drawio.png)

---

## 🗄️ Database Design
The system includes the following main entities:
- Users
- Documents
- Versions

Each document can have multiple versions, and each version goes  
through a review process before approval.

---

### 📁 Server Module Structure (dms-server)
The backend follows a standard N-tier architecture:
- config: Security configurations and DataSeeder for initial database population.
- controller: REST endpoints for Documents, Users, and System Health.
- dto: Request and Response objects (Data Transfer Objects)
- exception: Centralized error handling.
- model: Domain entities including Document, Version, User, and Role.
- repository: Data access layer using Spring Data JPA.
- service: Implementation of the core business logic.
- security: Authentication & authorization

---

## ⚙️ Technologies
- Backend: Java / Spring Boot
- Database: MySQL
- Frontend: HTML, CSS, JavaScript
- Version Control: Git
- Containerization: Docker & Docker Compose

---

## 🛠️ Installation & Setup
1. Clone the repository:
```
git clone https://github.com/IvanTsekov12/Proekt-SAP.git
cd Proekt-SAP
```

2. Configuration:  
Create a MySQL database  
The project uses Docker to run MySQL in a container.  
```
docker-compose up -d
```
Navigate to **dms-server/src/main/resources/application.yml** to configure your database connection and server port.  

To stop the database:
```
docker-compose down
```


3. Build the project:
```
mvn clean install
```

4. Run the application:
```
./mvnw spring-boot:run
```

5. After starting the application, open:
```
http://localhost:8080
```
