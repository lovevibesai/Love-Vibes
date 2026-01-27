-- Profile Prompts Migration
-- Adds support for Hinge-style profile prompts

-- Prompts Library (predefined questions)
CREATE TABLE ProfilePrompts (
    id TEXT PRIMARY KEY,
    prompt_text TEXT NOT NULL,
    category TEXT, -- 'personality', 'lifestyle', 'values', 'fun'
    is_active BOOLEAN DEFAULT TRUE,
    created_at INTEGER
);

-- User's prompt responses (3 per user)
CREATE TABLE UserPromptResponses (
    user_id TEXT,
    prompt_id TEXT,
    response_text TEXT NOT NULL,
    display_order INTEGER, -- 0, 1, 2 for the 3 selected prompts
    created_at INTEGER,
    updated_at INTEGER,
    PRIMARY KEY (user_id, prompt_id),
    FOREIGN KEY(user_id) REFERENCES Users(id),
    FOREIGN KEY(prompt_id) REFERENCES ProfilePrompts(id)
);

CREATE INDEX idx_user_prompts ON UserPromptResponses(user_id);

-- Seed data: 20 engaging prompts
INSERT INTO ProfilePrompts (id, prompt_text, category, is_active, created_at) VALUES
('p1', 'Two truths and a lie', 'fun', TRUE, strftime('%s', 'now')),
('p2', 'My simple pleasures', 'lifestyle', TRUE, strftime('%s', 'now')),
('p3', 'I''m overly competitive about...', 'personality', TRUE, strftime('%s', 'now')),
('p4', 'The way to win me over is...', 'personality', TRUE, strftime('%s', 'now')),
('p5', 'I''m looking for...', 'values', TRUE, strftime('%s', 'now')),
('p6', 'A perfect day for me is...', 'lifestyle', TRUE, strftime('%s', 'now')),
('p7', 'I geek out on...', 'personality', TRUE, strftime('%s', 'now')),
('p8', 'My most controversial opinion', 'fun', TRUE, strftime('%s', 'now')),
('p9', 'I won''t shut up about...', 'personality', TRUE, strftime('%s', 'now')),
('p10', 'The key to my heart is...', 'values', TRUE, strftime('%s', 'now')),
('p11', 'I''m secretly really good at...', 'fun', TRUE, strftime('%s', 'now')),
('p12', 'My ideal Sunday morning', 'lifestyle', TRUE, strftime('%s', 'now')),
('p13', 'I value...', 'values', TRUE, strftime('%s', 'now')),
('p14', 'My love language is...', 'values', TRUE, strftime('%s', 'now')),
('p15', 'I''m weirdly attracted to...', 'fun', TRUE, strftime('%s', 'now')),
('p16', 'My go-to karaoke song', 'fun', TRUE, strftime('%s', 'now')),
('p17', 'I''ll pick the restaurant if...', 'lifestyle', TRUE, strftime('%s', 'now')),
('p18', 'My biggest flex', 'personality', TRUE, strftime('%s', 'now')),
('p19', 'I''m the type of texter who...', 'personality', TRUE, strftime('%s', 'now')),
('p20', 'Together we could...', 'values', TRUE, strftime('%s', 'now'));
