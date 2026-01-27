-- Advanced Filters Migration
-- Adds education and kids fields to UserPreferences

ALTER TABLE UserPreferences ADD COLUMN filter_education JSON;
ALTER TABLE UserPreferences ADD COLUMN filter_has_kids JSON;
ALTER TABLE UserPreferences ADD COLUMN filter_wants_kids JSON;
