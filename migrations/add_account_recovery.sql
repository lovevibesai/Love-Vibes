-- Account Recovery Tables
CREATE TABLE PasswordResetTokens (
    user_id TEXT NOT NULL,
    token TEXT PRIMARY KEY,
    expires_at INTEGER NOT NULL,
    created_at INTEGER NOT NULL,
    FOREIGN KEY(user_id) REFERENCES Users(id)
);

CREATE INDEX idx_reset_tokens_expiry ON PasswordResetTokens(expires_at);
