-- Proximity Alerts System
-- Real-time meetup triggers based on location

CREATE TABLE ProximitySettings (
    user_id TEXT PRIMARY KEY,
    enabled BOOLEAN DEFAULT FALSE,
    current_lat REAL,
    current_long REAL,
    last_updated INTEGER,
    geofence_radius INTEGER DEFAULT 500, -- meters
    FOREIGN KEY(user_id) REFERENCES Users(id)
);

CREATE TABLE ProximityAlerts (
    id TEXT PRIMARY KEY,
    user_a_id TEXT,
    user_b_id TEXT,
    distance_meters INTEGER,
    venue_name TEXT,
    venue_address TEXT,
    venue_type TEXT, -- 'cafe', 'restaurant', 'park'
    status TEXT DEFAULT 'sent', -- 'sent', 'accepted', 'declined', 'expired'
    created_at INTEGER,
    expires_at INTEGER,
    FOREIGN KEY(user_a_id) REFERENCES Users(id),
    FOREIGN KEY(user_b_id) REFERENCES Users(id)
);

CREATE INDEX idx_proximity_enabled ON ProximitySettings(enabled);
CREATE INDEX idx_proximity_alerts_status ON ProximityAlerts(status, expires_at);
