/*
# Create module_questions table

1. New Tables
- `module_questions`
  - `id` (serial, primary key)
  - `module_id` (text) — module slug: gate-puzzler, circuit-builder, waveform-lab, power-quest, state-machine, cpu-boss
  - `level` (text) — 'basic', 'intermediate', 'advanced'
  - `question` (text) — the question text
  - `options` (text[]) — 4 answer choices
  - `correct_index` (integer) — 0-based correct answer index
  - `explanation` (text) — shown after answering
  - `xp_reward` (integer) — XP earned for correct answer

2. Indexes on module_id and (module_id, level)

3. Security — RLS enabled, anon+authenticated can SELECT (public content)
*/

CREATE TABLE IF NOT EXISTS module_questions (
  id serial PRIMARY KEY,
  module_id text NOT NULL,
  level text NOT NULL CHECK (level IN ('basic', 'intermediate', 'advanced')),
  question text NOT NULL,
  options text[] NOT NULL,
  correct_index integer NOT NULL,
  explanation text DEFAULT '',
  xp_reward integer NOT NULL DEFAULT 10,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_mq_module ON module_questions(module_id);
CREATE INDEX IF NOT EXISTS idx_mq_module_level ON module_questions(module_id, level);

ALTER TABLE module_questions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_read_mq" ON module_questions;
CREATE POLICY "anon_read_mq" ON module_questions FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "auth_insert_mq" ON module_questions;
CREATE POLICY "auth_insert_mq" ON module_questions FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_update_mq" ON module_questions;
CREATE POLICY "auth_update_mq" ON module_questions FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_delete_mq" ON module_questions;
CREATE POLICY "auth_delete_mq" ON module_questions FOR DELETE
  TO authenticated USING (true);
