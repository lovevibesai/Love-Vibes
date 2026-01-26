-- Love Vibes Seed Data
-- Populate D1 with vibrant profiles for testing the Premium Visual WOW Experience

-- Clear existing data (Optional for local dev)
-- DELETE FROM Users;
-- DELETE FROM UserPreferences;

-- Mock Users
INSERT INTO Users (id, name, birth_date, bio, gender, interested_in, job_title, company, school, interests, height, location, hometown, relationship_goals, drinking, smoking, exercise_frequency, diet, pets, star_sign, is_verified, verification_status, is_id_verified, trust_score, main_photo_url, photo_urls, video_intro_url, credits_balance, subscription_tier, lat, long, s2_cell_id, mode, is_onboarded, last_active, created_at)
VALUES 
(
    'u1', 'Isabella', 788918400, 'Traveler at heart, coffee addict, and amateur photographer. Let''s explore the city together!', 1, 0, 
    'UX Designer', 'Tech Studio', 'Stanford', '["Photography", "Coffee", "Travel", "Jazz"]', 
    168, 'San Francisco, CA', 'Los Angeles', '["long-term", "friendship"]', 
    'socially', 'never', 'active', 'omnivore', 'dog', 'Leo', 
    1, 'verified', 1, 98, 
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&q=80', 
    '["https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&q=80", "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&q=80"]',
    'https://customer-<ID>.cloudflarestream.com/<UID>/watch', 500, 'platinum', 
    37.7749, -122.4194, '8085800000000000', 0, 1, strftime('%s','now'), strftime('%s','now')
),
(
    'u2', 'Marcus', 820454400, 'Fitness entusiast, weekend hiker, and startup founder. Looking for someone with big dreams.', 0, 1, 
    'Founder', 'VibeVentures', 'Berkeley', '["Hiking", "Startups", "Fitness", "Sailing"]', 
    185, 'San Francisco, CA', 'Austin', '["long-term"]', 
    'socially', 'never', 'active', 'omnivore', 'cat', 'Aries', 
    1, 'verified', 0, 85, 
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&q=80', 
    '["https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&q=80"]',
    NULL, 250, 'plus', 
    37.7749, -122.4194, '8085800000000000', 0, 1, strftime('%s','now'), strftime('%s','now')
),
(
    'u3', 'Elena', 851990400, 'Art curator, vintage clothes lover, and deep seeker of meaningful connections.', 1, 2, 
    'Curator', 'Modern Art Inst', 'NYU', '["Art", "Fashion", "Vinyl", "Yoga"]', 
    172, 'San Francisco, CA', 'NYC', '["friendship", "casual"]', 
    'never', 'socially', 'sometimes', 'vegetarian', 'both', 'Libra', 
    1, 'verified', 1, 92, 
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&q=80', 
    '["https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&q=80"]',
    'https://customer-<ID>.cloudflarestream.com/<UID2>/watch', 1000, 'platinum', 
    37.7749, -122.4194, '8085800000000000', 1, 1, strftime('%s','now'), strftime('%s','now')
),
(
    'u4', 'Juliana', 883526400, 'Full-time foodie and part-time explorer. Let''s find the best taco in town!', 1, 0, 
    'Chef', 'Local Bistro', 'CIA', '["Cooking", "Foodie", "Exploration", "Wine"]', 
    165, 'San Francisco, CA', 'Chicago', '["casual"]', 
    'socially', 'socially', 'active', 'omnivore', 'neither', 'Sagittarius', 
    0, 'unverified', 0, 45, 
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&q=80', 
    '["https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&q=80"]',
    NULL, 50, 'free', 
    37.7749, -122.4194, '8085800000000000', 0, 1, strftime('%s','now'), strftime('%s','now')
);

-- Mock UserPreferences
INSERT INTO UserPreferences (user_id, distance_max, age_min, age_max, show_me, filter_relationship_goals, created_at)
VALUES 
('u1', 50, 24, 35, 'men', '["long-term", "friendship"]', strftime('%s','now')),
('u2', 25, 22, 30, 'women', '["long-term"]', strftime('%s','now')),
('u3', 100, 21, 40, 'everyone', '["friendship", "casual"]', strftime('%s','now')),
('u4', 10, 24, 32, 'men', '["casual"]', strftime('%s','now'));
