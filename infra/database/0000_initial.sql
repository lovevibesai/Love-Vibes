-- Love Vibes Database Schema (D1 / SQLite)

-- 1. Users Table (Extended for Love Vibes)
CREATE TABLE Users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE,
    phone_number TEXT,
    password_hash TEXT, -- If handling own auth
    ids_user_id TEXT, -- If comparing with Identity Service
    
    -- Profile Basics
    name TEXT,
    birth_date INTEGER,
    age INTEGER,
    bio TEXT,
    gender INTEGER, -- 0: Male, 1: Female, 2: Non-binary
    interested_in INTEGER, -- 0: Men, 1: Women, 2: Everyone
    job_title TEXT,
    company TEXT,
    school TEXT,
    interests JSON,
    referral_code TEXT,
    scenario_keys INTEGER DEFAULT 0,
  
    -- Priority Profile Fields (Phase 1)
    height INTEGER, -- in cm
    location TEXT,
    hometown TEXT,
    relationship_goals JSON, -- array: ["long-term", "casual", "friendship", etc.]
    drinking TEXT, -- "never", "socially", "regularly", "prefer-not-say"
    smoking TEXT, -- "never", "socially", "regularly", "trying-quit", "prefer-not-say"
    exercise_frequency TEXT, -- "active", "sometimes", "rarely"
    diet TEXT, -- "omnivore", "vegetarian", "vegan", "pescatarian", etc.
    pets TEXT, -- "dog", "cat", "both", "neither", "have-pets"
    languages JSON, -- array of language codes: ["en", "es", "fr"]
  
    -- Extended Profile Fields (Phase 2)
    ethnicity JSON, -- array, optional
    religion TEXT, -- optional
    has_children TEXT, -- "yes", "no"
    wants_children TEXT, -- "yes", "no", "maybe", "dont-want"
    star_sign TEXT, -- zodiac sign
  
    -- Verification & Identity
    is_verified BOOLEAN DEFAULT FALSE,
    verification_status TEXT DEFAULT 'unverified', -- 'unverified', 'pending', 'verified', 'rejected'
    is_id_verified BOOLEAN DEFAULT FALSE,
    trust_score INTEGER DEFAULT 0,
    
    -- Content
    main_photo_url TEXT,
    photo_urls TEXT, -- JSON array
    video_intro_url TEXT,

    -- Monetization
    credits_balance INTEGER DEFAULT 0,
    subscription_tier TEXT DEFAULT 'free', -- 'free', 'plus', 'platinum'
    subscription_expires_at INTEGER,

    -- Geosharding
    lat REAL,
    long REAL,
    s2_cell_id TEXT, -- Level 12
    city TEXT,
    
    -- Application State
    mode INTEGER DEFAULT 0,
    onboarding_step INTEGER DEFAULT 0,
    is_onboarded BOOLEAN DEFAULT FALSE,
    last_active INTEGER,
    created_at INTEGER,
    updated_at INTEGER
);

CREATE INDEX idx_users_s2 ON Users(s2_cell_id);
CREATE INDEX idx_users_mode ON Users(mode);

-- 2. Swipes / Interactions
CREATE TABLE Swipes (
    actor_id TEXT,
    target_id TEXT,
    type TEXT, -- 'LIKE', 'PASS', 'SUPERLIKE'
    timestamp INTEGER,
    PRIMARY KEY (actor_id, target_id)
);

-- 3. Matches (Successful Links)
CREATE TABLE Matches (
    id TEXT PRIMARY KEY, -- uuid
    user_a_id TEXT,
    user_b_id TEXT,
    created_at INTEGER,
    last_message_at INTEGER,
    chat_room_do_id TEXT -- ID of the Durable Object
);

CREATE INDEX idx_matches_users ON Matches(user_a_id, user_b_id);

-- 4. Gifts (Love Vibes Gifting System)
CREATE TABLE Gifts (
    id TEXT PRIMARY KEY,
    sender_id TEXT,
    recipient_id TEXT,
    item_id TEXT, -- Ref to a catalog (hardcoded or DB)
    message TEXT,
    status TEXT, -- 'SENT', 'ACCEPTED', 'REJECTED'
    created_at INTEGER
);

-- Safety & Moderation
CREATE TABLE Reports (
    id TEXT PRIMARY KEY,
    reporter_id TEXT,
    reported_id TEXT,
    reason TEXT,
    details TEXT,
    timestamp INT,
    status TEXT DEFAULT 'PENDING' -- 'PENDING', 'REVIEWED', 'DISMISSED'
);

CREATE TABLE Blocks (
    blocker_id TEXT,
    blocked_id TEXT,
    timestamp INT,
    PRIMARY KEY (blocker_id, blocked_id)
);

-- 5. Verification Requests
CREATE TABLE Verifications (
    user_id TEXT PRIMARY KEY,
    selfie_url TEXT,
    status TEXT, -- 'PENDING', 'APPROVED', 'REJECTED'
    ai_confidence_score REAL,
    created_at INTEGER
);

-- 6. User Preferences (Discovery Filters)
CREATE TABLE UserPreferences (
    user_id TEXT PRIMARY KEY,
    distance_max INTEGER DEFAULT 50,
    age_min INTEGER DEFAULT 18,
    age_max INTEGER DEFAULT 99,
    height_min INTEGER,
    height_max INTEGER,
    show_me TEXT DEFAULT 'everyone', -- 'men', 'women', 'everyone'
    
    -- Advanced Filters (Premium)
    filter_relationship_goals JSON,
    filter_drinking JSON,
    filter_smoking JSON,
    filter_education JSON,
    filter_zodiac JSON,
    show_verified_only BOOLEAN DEFAULT FALSE,
    show_with_video_only BOOLEAN DEFAULT FALSE,
    min_trust_score INTEGER DEFAULT 0,
    
    -- Dealbreakers (Platinum)
    dealbreakers JSON,
    
    created_at INTEGER,
    updated_at INTEGER,
    FOREIGN KEY(user_id) REFERENCES Users(id)
);

-- 7. Authentication Challenges (Internal)
CREATE TABLE AuthChallenges (
    id TEXT PRIMARY KEY,
    challenge TEXT NOT NULL,
    user_id TEXT NOT NULL,
    type TEXT NOT NULL, -- 'registration' or 'login'
    expires_at INTEGER NOT NULL
);

-- 8. WebAuthn User Credentials
CREATE TABLE UserCredentials (
    id TEXT PRIMARY KEY, -- credentialID (base64)
    user_id TEXT NOT NULL,
    public_key TEXT NOT NULL, -- (base64)
    counter INTEGER DEFAULT 0,
    created_at INTEGER,
    FOREIGN KEY(user_id) REFERENCES Users(id)
);

-- 9. Financial Transactions
CREATE TABLE Transactions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    type TEXT NOT NULL, -- 'credit_purchase', 'subscription', 'gift'
    amount REAL DEFAULT 0,
    credits_granted INTEGER DEFAULT 0,
    status TEXT DEFAULT 'PENDING', -- 'PENDING', 'COMPLETED', 'FAILED'
    timestamp INTEGER NOT NULL,
    FOREIGN KEY(user_id) REFERENCES Users(id)
);

CREATE INDEX idx_transactions_user ON Transactions(user_id);