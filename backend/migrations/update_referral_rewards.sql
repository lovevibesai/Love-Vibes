-- Update Referral System for Scenario Keys
ALTER TABLE Users ADD COLUMN scenario_keys INTEGER DEFAULT 0;
