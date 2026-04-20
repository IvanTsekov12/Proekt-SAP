# 🔌 API Overview

## What is API?

API (Application Programming Interface) allows communication between client and server.

This project implements a REST (Representational State Transfer) architecture. REST is  
a stateless, client-server communication style that uses standard HTTP methods to manage  
resources (Documents, Users, Versions).

---

## REST Principles

- Uses HTTP methods:
  - GET → read
  - POST → create
  - PUT → update
  - DELETE → delete
- Stateless communication

---

## Main Endpoints

### Documents

- Create document
- Get document
- Get all documents

### Versions

- Create version
- Submit for review
- Approve / reject

### Users

- Create user
- Get all users
- Manage roles

---

## Request Flow Example

1. Client sends POST `/documents`
2. Controller receives request
3. DTO validates input
4. Service processes logic
5. Repository saves to database

---

## DTO Role
DTOs are used to:
- Transfer data safely
- Prevent exposing internal models 

---

### Status Codes
- `200 OK` - Success
- `201 Created` - Resource created successfully
- `400 Bad Request` - Validation error
- `403 Forbidden` - Access denied due to role restrictions.
- `440 Not Found` - Resource does not exist


### Data Flow (Request/Response)
The API follows a strict internal flow to ensure data integrity:
- Client Request: Sends a JSON body (e.g., CreateDocumentRequest).
- Controller: Intercepts the request and maps it to a method.
- DTO Validation: Ensures all required fields (like title) are present.
- Service Layer: Executes business logic (e.g., "Only a Reviewer can approve").
- JSON Response: Returns the result (e.g., DocumentResponse) back to the client.