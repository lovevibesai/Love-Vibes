-- Add composite index for efficient swipe exclusion in feed generation
CREATE INDEX IF NOT EXISTS idx_swipes_actor_target ON Swipes(actor_id, target_id);
