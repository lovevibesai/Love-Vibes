-- Vibe Windows System
-- Time-boxed matching for focused, intentional dating

CREATE TABLE VibeWindows (
    user_id TEXT,
    day_of_week INTEGER, -- 0-6 (Sunday-Saturday)
    start_hour INTEGER, -- 0-23
    duration_minutes INTEGER DEFAULT 60,
    is_active BOOLEAN DEFAULT TRUE,
    created_at INTEGER,
    PRIMARY KEY (user_id, day_of_week, start_hour),
    FOREIGN KEY(user_id) REFERENCES Users(id)
);

CREATE TABLE VibeWindowActivity (
    user_id TEXT,
    window_start INTEGER,
    window_end INTEGER,
    matches_made INTEGER DEFAULT 0,
    swipes_made INTEGER DEFAULT 0,
    messages_sent INTEGER DEFAULT 0,
    PRIMARY KEY (user_id, window_start)
);

CREATE INDEX idx_vibe_windows_active ON VibeWindows(is_active, day_of_week, start_hour);
