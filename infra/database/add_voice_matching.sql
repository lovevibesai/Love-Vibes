-- Voice-First Matching System
-- Match based on voice before revealing photos

CREATE TABLE VoiceProfiles (
    user_id TEXT PRIMARY KEY,
    voice_url TEXT NOT NULL,
    duration INTEGER,
    tone_score REAL,
    pace_score REAL,
    emotion_score REAL,
    authenticity_score REAL,
    transcription TEXT,
    created_at INTEGER,
    FOREIGN KEY(user_id) REFERENCES Users(id)
);

CREATE TABLE VoiceSwipes (
    actor_id TEXT,
    target_id TEXT,
    type TEXT, -- 'LIKE', 'PASS'
    photos_unlocked BOOLEAN DEFAULT FALSE,
    timestamp INTEGER,
    PRIMARY KEY (actor_id, target_id)
);

CREATE INDEX idx_voice_swipes_actor ON VoiceSwipes(actor_id);
CREATE INDEX idx_voice_swipes_mutual ON VoiceSwipes(actor_id, target_id, type);
