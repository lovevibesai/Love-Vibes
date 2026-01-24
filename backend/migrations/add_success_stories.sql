-- Success Stories Table
CREATE TABLE SuccessStories (
    id TEXT PRIMARY KEY,
    user_a_id TEXT NOT NULL,
    user_b_id TEXT NOT NULL,
    user_a_name TEXT NOT NULL,
    user_b_name TEXT NOT NULL,
    user_a_photo TEXT,
    user_b_photo TEXT,
    story_text TEXT NOT NULL,
    relationship_length TEXT,
    wedding_fund_contributed BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,
    approved BOOLEAN DEFAULT FALSE,
    created_at INTEGER NOT NULL,
    FOREIGN KEY(user_a_id) REFERENCES Users(id),
    FOREIGN KEY(user_b_id) REFERENCES Users(id)
);

CREATE INDEX idx_success_stories_approved ON SuccessStories(approved, created_at);
