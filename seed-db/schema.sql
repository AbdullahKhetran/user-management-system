-- these sql queries were ran manually in railway query box

-- to create table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  age INT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- create index on age (for sorting)
CREATE INDEX IF NOT EXISTS idx_users_age ON users(age);

-- create composite index with age and id (tiebreak for age) 
CREATE INDEX idx_users_age_id ON users (age ASC, id ASC);
-- since added a composite index
DROP INDEX IF EXISTS idx_users_age;