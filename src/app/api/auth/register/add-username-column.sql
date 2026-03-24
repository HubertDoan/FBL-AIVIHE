-- Add username column to citizens table for auto-generated usernames
-- Format: firstName + firstChar(lastName) + firstChar(middleName) + "_" + currentYear
-- Example: "Nguyễn Văn Minh" → "MinhNV_2026"

ALTER TABLE citizens ADD COLUMN IF NOT EXISTS username VARCHAR(50) UNIQUE;
CREATE INDEX IF NOT EXISTS idx_citizens_username ON citizens(username);
