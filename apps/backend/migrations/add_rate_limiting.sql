-- Rate Limiting Table
CREATE TABLE RateLimits (
    user_id TEXT NOT NULL,
    action TEXT NOT NULL, -- 'swipe', 'message', 'signup', 'api'
    timestamp INTEGER NOT NULL,
    PRIMARY KEY (user_id, action, timestamp)
);

CREATE INDEX idx_ratelimits_cleanup ON RateLimits(timestamp);
