-- Migration: Add missing user fields for stability
ALTER TABLE Users ADD COLUMN age INTEGER;
ALTER TABLE Users ADD COLUMN referral_code TEXT;
ALTER TABLE Users ADD COLUMN scenario_keys INTEGER DEFAULT 0;

-- Optional: Initialize some default values if needed
UPDATE Users SET scenario_keys = 3 WHERE scenario_keys IS NULL;
