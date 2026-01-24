-- Rewind History Table
CREATE TABLE RewindHistory (
    user_id TEXT NOT NULL,
    date TEXT NOT NULL, -- YYYY-MM-DD format
    timestamp INTEGER NOT NULL,
    PRIMARY KEY (user_id, date),
    FOREIGN KEY(user_id) REFERENCES Users(id)
);

CREATE INDEX idx_rewind_date ON RewindHistory(date);
