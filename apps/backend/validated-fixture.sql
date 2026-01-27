-- Love Vibes Validated Fixture
-- Fully pre-configured user for end-to-end testing

-- 1. Create the User
INSERT OR REPLACE INTO Users (
    id, email, name, age, bio, gender, interested_in, 
    job_title, company, school, interests, 
    is_verified, verification_status, is_id_verified, trust_score,
    main_photo_url, photo_urls,
    credits_balance, subscription_tier,
    is_onboarded, onboarding_step, mode,
    lat, long, s2_cell_id, city,
    created_at, last_active
) VALUES (
    'fixture-user-1', 
    'thelovevibes.ai@gmail.com', 
    'Max Vibe', 
    27, 
    'Engineering the future of connections. Love Vibes enthusiast and validated tester.', 
    0, -- Male
    2, -- Everyone
    'Lead Architect', 
    'Love Vibes AI', 
    'Stanford University', 
    '["Coding", "AI", "Modern Art", "Skydiving", "Travel"]',
    1, -- is_verified
    'verified',
    1, -- is_id_verified
    99, -- trust_score
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80',
    '["https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80", "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&q=80"]',
    1000, 
    'platinum',
    1, -- is_onboarded
    6, -- Final step
    0, -- Dating mode
    37.7749, -122.4194, '8085800000000000', 'San Francisco',
    strftime('%s','now'), strftime('%s','now')
);

-- 2. Create Discovery Preferences
INSERT OR REPLACE INTO UserPreferences (
    user_id, distance_max, age_min, age_max, show_me, 
    filter_relationship_goals, show_verified_only, created_at
) VALUES (
    'fixture-user-1',
    50, 18, 40, 'everyone',
    '["long-term", "friendship"]',
    1,
    strftime('%s','now')
);

-- 3. Create a Mock Passkey Credential
INSERT OR REPLACE INTO UserCredentials (
    id, user_id, public_key, counter, created_at
) VALUES (
    'mock_credential_id_base64_placeholder',
    'fixture-user-1',
    'mock_public_key_base64_placeholder',
    0,
    strftime('%s','now')
);

-- Fixture Complete
