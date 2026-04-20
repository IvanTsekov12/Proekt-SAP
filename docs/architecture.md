# 🏗️ System Architecture

## Overview
The system follows a simplified N-tier architecture, focused primarily on the backend layer.  
The design follows the principle of Separation of Concerns, ensuring that each layer has a   
distinct responsibility.

To simplify development and the architecture, the current implementation focuses on:
- **dms-server** – the core backend application

---

## Architecture Layers

### 1. Controller Layer
Handles incoming HTTP requests.

- Receives requests from clients (e.g. Postman, browser)
- Validates input using DTOs
- Calls the service layer

Examples:
- DocumentController
- UserController
- HealthController

---

### 2. Service Layer
Contains the business logic of the system.

- Implements business rules
- Handles workflows (e.g. version approval)
- Coordinates between controller and repository
- Manages database transactions (e.g., creating a Document and its first Version must happen together or not at all).

---

### 3. Repository Layer
Responsible for direct interaction with the database.

- Uses Spring Data JPA
- Performs CRUD operations
- Maps objects to database tables

---

### 4. Model Layer
Defines the core system entities:

- User
- Document
- Version
- Role, VersionStatus which are ENUM

Mapping: Java objects to SQL tables.

---

### 5. Security Layer
Handles authentication and authorization.

- Role-based access control
- Restricts user actions based on roles
- Protects the system from unauthorized access.

---

## Data Flow

1. Client sends HTTP request
2. Controller receives request
3. Service processes logic
4. Repository interacts with database
5. Response is returned to client

---

## Architecture Characteristics

- Modular structure within backend
- Clear separation of concerns
- Easy to extend with frontend in future
- Suitable for REST API-based systems
- Separation of concerns
- Easier debugging and testing
- DTO-based Communication: Internal database models (Entities) are never exposed directly to the API.  
This prevents accidental data leaks and allows the database schema to change without breaking the API.