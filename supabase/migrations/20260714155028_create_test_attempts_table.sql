/*
# Create test_attempts table

1. New Tables
- `test_attempts`
  - `id` (serial, primary key)
  - `module_id` (text) — which module the test was for
  - `level` (text) — 'basic', 'intermediate', 'advanced', or 'mixed'
  - `total_questions` (integer) — number of questions in the test
  - `correct_answers` (integer) — how many the user got right
  - `xp_earned` (integer) — XP gained from this attempt
  - `time_taken_seconds` (integer) — how long the test took
  - `passed` (boolean) — whether the user passed (>= 70%)
  - `score_percent` (integer) — percentage score
  - `answers` (jsonb) — array of {question_id, selected_index, correct} for review
  - `created_at` (timestamp)

2. Indexes
- Index on `module_id` for filtering by module
- Index on `created_at` for ordering by recency

3. Security
- RLS enabled. Single-tenant no-auth app: anon+authenticated can read/insert/update their own test attempts.
*/

CREATE TABLE IF NOT EXISTS test_attempts (
  id serial PRIMARY KEY,
  module_id text NOT NULL,
  level text NOT NULL,
  total_questions integer NOT NULL,
  correct_answers integer NOT NULL,
  xp_earned integer NOT NULL DEFAULT 0,
  time_taken_seconds integer NOT NULL DEFAULT 0,
  passed boolean NOT NULL DEFAULT false,
  score_percent integer NOT NULL DEFAULT 0,
  answers jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_test_attempts_module ON test_attempts(module_id);
CREATE INDEX IF NOT EXISTS idx_test_attempts_created ON test_attempts(created_at DESC);

ALTER TABLE test_attempts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_read_test_attempts" ON test_attempts;
CREATE POLICY "anon_read_test_attempts" ON test_attempts FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_test_attempts" ON test_attempts;
CREATE POLICY "anon_insert_test_attempts" ON test_attempts FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_test_attempts" ON test_attempts;
CREATE POLICY "anon_update_test_attempts" ON test_attempts FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_test_attempts" ON test_attempts;
CREATE POLICY "anon_delete_test_attempts" ON test_attempts FOR DELETE
  TO anon, authenticated USING (true);
