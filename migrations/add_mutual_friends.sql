-- Mutual Friend Introduction System
-- Leverage social graphs for trusted introductions

CREATE TABLE SocialConnections (
    user_id TEXT,
    friend_hash TEXT, -- SHA-256 hash of phone number for privacy
    connection_type TEXT, -- 'phone', 'instagram', 'linkedin'
    friend_name TEXT,
    created_at INTEGER,
    PRIMARY KEY (user_id, friend_hash, connection_type),
    FOREIGN KEY(user_id) REFERENCES Users(id)
);

CREATE TABLE IntroductionRequests (
    id TEXT PRIMARY KEY,
    requester_id TEXT,
    target_id TEXT,
    mutual_friend_id TEXT,
    status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'declined'
    friend_message TEXT,
    created_at INTEGER,
    responded_at INTEGER,
    FOREIGN KEY(requester_id) REFERENCES Users(id),
    FOREIGN KEY(target_id) REFERENCES Users(id),
    FOREIGN KEY(mutual_friend_id) REFERENCES Users(id)
);

CREATE INDEX idx_social_connections_hash ON SocialConnections(friend_hash);
CREATE INDEX idx_intro_requests_friend ON IntroductionRequests(mutual_friend_id, status);
