-- Biometric Chemistry Test System
-- Heart rate synchrony detection during video calls

CREATE TABLE ChemistryTests (
    id TEXT PRIMARY KEY,
    match_id TEXT,
    user_a_id TEXT,
    user_b_id TEXT,
    user_a_hr_avg INTEGER,
    user_b_hr_avg INTEGER,
    user_a_hr_variance REAL,
    user_b_hr_variance REAL,
    sync_score REAL, -- 0-100
    chemistry_detected BOOLEAN,
    test_duration INTEGER,
    created_at INTEGER,
    FOREIGN KEY(match_id) REFERENCES Matches(id),
    FOREIGN KEY(user_a_id) REFERENCES Users(id),
    FOREIGN KEY(user_b_id) REFERENCES Users(id)
);

CREATE INDEX idx_chemistry_tests_match ON ChemistryTests(match_id);
CREATE INDEX idx_chemistry_tests_detected ON ChemistryTests(chemistry_detected);
