-- Moderation Actions Table
CREATE TABLE ModerationActions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    action TEXT NOT NULL, -- 'WARNING', 'BAN', 'UNBAN'
    reason TEXT,
    admin_id TEXT NOT NULL,
    timestamp INTEGER NOT NULL,
    FOREIGN KEY(user_id) REFERENCES Users(id)
);

CREATE INDEX idx_moderation_user ON ModerationActions(user_id);
CREATE INDEX idx_moderation_admin ON ModerationActions(admin_id);
