CREATE DATABASE IF NOT EXISTS dms;
USE dms;

CREATE TABLE IF NOT EXISTS users (
    id BINARY(16) PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL
);

CREATE TABLE IF NOT EXISTS document (
    id BINARY(16) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    created_at DATETIME NOT NULL,
    authod_id BINARY(16) NOT NULL,
    FOREIGN KEY (authod_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS version (
    id BINARY(16) PRIMARY KEY,
    version_number INT NOT NULL,
    content TEXT,
    status VARCHAR(50),
    created_at DATETIME,

    document_id BINARY(16),
    created_by BINARY(16),
    approved_by BINARY(16),

    approved_at DATETIME,

    FOREIGN KEY (document_id) REFERENCES document(id),
    FOREIGN KEY (created_by) REFERENCES users(id),
    FOREIGN KEY (approved_by) REFERENCES users(id)
);