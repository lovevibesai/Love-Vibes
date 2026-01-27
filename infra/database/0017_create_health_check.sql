-- Migration: Create HealthCheck Table
-- Purpose: Used for deep health verification (Write tests)
CREATE TABLE IF NOT EXISTS HealthCheck (
    id INTEGER PRIMARY KEY,
    timestamp INTEGER NOT NULL
);
