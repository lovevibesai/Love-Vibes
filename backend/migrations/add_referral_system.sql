-- Referral System Tables
ALTER TABLE Users ADD COLUMN referral_code TEXT UNIQUE;

CREATE TABLE Referrals (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    referrer_id TEXT NOT NULL,
    referred_id TEXT NOT NULL,
    status TEXT DEFAULT 'signed_up', -- 'signed_up', 'active', 'premium'
    created_at INTEGER NOT NULL,
    FOREIGN KEY(referrer_id) REFERENCES Users(id),
    FOREIGN KEY(referred_id) REFERENCES Users(id)
);

CREATE INDEX idx_referrals_referrer ON Referrals(referrer_id);
CREATE INDEX idx_referrals_referred ON Referrals(referred_id);
