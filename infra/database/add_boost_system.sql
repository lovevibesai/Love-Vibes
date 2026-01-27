-- Profile Boost Tables
CREATE TABLE ActiveBoosts (
    user_id TEXT PRIMARY KEY,
    started_at INTEGER NOT NULL,
    expires_at INTEGER NOT NULL,
    views_gained INTEGER DEFAULT 0,
    FOREIGN KEY(user_id) REFERENCES Users(id)
);

CREATE INDEX idx_boosts_expiry ON ActiveBoosts(expires_at);

CREATE TABLE BoostHistory (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    started_at INTEGER NOT NULL,
    ended_at INTEGER NOT NULL,
    views_gained INTEGER DEFAULT 0,
    matches_gained INTEGER DEFAULT 0,
    FOREIGN KEY(user_id) REFERENCES Users(id)
);

CREATE INDEX idx_boost_history_user ON BoostHistory(user_id);
