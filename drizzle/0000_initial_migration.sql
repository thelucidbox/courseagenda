-- This is our initial migration script
-- It creates all the tables we need for our application

-- Enable pgcrypto extension for UUID generation
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) NOT NULL UNIQUE,
  password TEXT,
  display_name TEXT,
  initials TEXT,
  email TEXT,
  google_id TEXT,
  profile_image_url TEXT,
  auth_provider TEXT,
  role TEXT NOT NULL DEFAULT 'user',
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  subscription_status TEXT NOT NULL DEFAULT 'free',
  subscription_expiry TIMESTAMP
);

-- Create oauth_tokens table
CREATE TABLE IF NOT EXISTS oauth_tokens (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  expires_at TIMESTAMP,
  scope TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, provider)
);

-- Create syllabi table
CREATE TABLE IF NOT EXISTS syllabi (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  course_code TEXT,
  course_name TEXT,
  instructor TEXT,
  term TEXT,
  uploaded_at TIMESTAMP NOT NULL DEFAULT NOW(),
  text_content TEXT,
  status TEXT NOT NULL DEFAULT 'uploaded',
  first_day_of_class TEXT,
  last_day_of_class TEXT,
  meeting_days TEXT[],
  meeting_time_start TEXT,
  meeting_time_end TEXT,
  calendar_provider TEXT,
  calendar_integrated BOOLEAN NOT NULL DEFAULT FALSE
);

-- Create course_events table
CREATE TABLE IF NOT EXISTS course_events (
  id SERIAL PRIMARY KEY,
  syllabus_id INTEGER NOT NULL REFERENCES syllabi(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  event_type TEXT NOT NULL,
  due_date TIMESTAMP NOT NULL,
  description TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create study_plans table
CREATE TABLE IF NOT EXISTS study_plans (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  syllabus_id INTEGER NOT NULL REFERENCES syllabi(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP NOT NULL,
  description TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  calendar_integrated BOOLEAN
);

-- Create study_sessions table
CREATE TABLE IF NOT EXISTS study_sessions (
  id SERIAL PRIMARY KEY,
  study_plan_id INTEGER NOT NULL REFERENCES study_plans(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  date TIMESTAMP NOT NULL,
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  description TEXT,
  calendar_event_id TEXT,
  location TEXT,
  event_type TEXT,
  related_event_id INTEGER REFERENCES course_events(id) ON DELETE SET NULL
);

-- Create sessions table for connect-pg-simple
CREATE TABLE IF NOT EXISTS "session" (
  "sid" varchar NOT NULL COLLATE "default",
  "sess" json NOT NULL,
  "expire" timestamp(6) NOT NULL,
  CONSTRAINT "session_pkey" PRIMARY KEY ("sid")
);

CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON "session" ("expire");