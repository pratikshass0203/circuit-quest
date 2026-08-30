/*
# Create engagement mechanics tables (single-tenant, no auth)

1. New Tables
- `player_state`: Stores the single player's XP, level, streak, and last active date.
- `badges`: Badge definitions with name, description, icon, and XP threshold to unlock.
- `quests`: Quest definitions with title, description, XP reward, and completion status.
- `leaderboard_entries`: Leaderboard rows with player name, XP, level, and avatar initials.
- `mastery_checks`: Quiz questions with topic, question, options, correct answer, and completion status.

2. Security
- Enable RLS on all tables.
- Allow anon + authenticated CRUD on all tables (single-tenant, intentionally public/shared data).

3. Notes
- This is a demo/landing page with no sign-in, so all data is shared and public.
- player_state has a single row pattern (id = 1) to track the current player.
- Badges auto-unlock based on XP threshold when player_state is updated.
- Leaderboard includes seed data with mock competitors.
*/

-- Player state (single row, id = 1)
CREATE TABLE IF NOT EXISTS player_state (
  id integer PRIMARY KEY DEFAULT 1,
  xp integer NOT NULL DEFAULT 0,
  level integer NOT NULL DEFAULT 1,
  streak integer NOT NULL DEFAULT 0,
  last_active_date date DEFAULT CURRENT_DATE,
  badges_earned text[] NOT NULL DEFAULT '{}',
  quests_completed text[] NOT NULL DEFAULT '{}',
  mastery_checks_passed text[] NOT NULL DEFAULT '{}',
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE player_state ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_player_state" ON player_state;
CREATE POLICY "anon_select_player_state" ON player_state FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_player_state" ON player_state;
CREATE POLICY "anon_insert_player_state" ON player_state FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_player_state" ON player_state;
CREATE POLICY "anon_update_player_state" ON player_state FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

-- Badges
CREATE TABLE IF NOT EXISTS badges (
  id text PRIMARY KEY,
  name text NOT NULL,
  description text NOT NULL,
  icon text NOT NULL,
  color text NOT NULL DEFAULT '#00d4aa',
  xp_threshold integer NOT NULL DEFAULT 0
);

ALTER TABLE badges ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_badges" ON badges;
CREATE POLICY "anon_select_badges" ON badges FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_badges" ON badges;
CREATE POLICY "anon_insert_badges" ON badges FOR INSERT
  TO anon, authenticated WITH CHECK (true);

-- Quests
CREATE TABLE IF NOT EXISTS quests (
  id text PRIMARY KEY,
  title text NOT NULL,
  description text NOT NULL,
  xp_reward integer NOT NULL DEFAULT 50,
  icon text NOT NULL DEFAULT 'sword'
);

ALTER TABLE quests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_quests" ON quests;
CREATE POLICY "anon_select_quests" ON quests FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_quests" ON quests;
CREATE POLICY "anon_insert_quests" ON quests FOR INSERT
  TO anon, authenticated WITH CHECK (true);

-- Leaderboard
CREATE TABLE IF NOT EXISTS leaderboard_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_name text NOT NULL,
  initials text NOT NULL DEFAULT '??',
  xp integer NOT NULL DEFAULT 0,
  level integer NOT NULL DEFAULT 1,
  is_current_player boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE leaderboard_entries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_leaderboard" ON leaderboard_entries;
CREATE POLICY "anon_select_leaderboard" ON leaderboard_entries FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_leaderboard" ON leaderboard_entries;
CREATE POLICY "anon_insert_leaderboard" ON leaderboard_entries FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_leaderboard" ON leaderboard_entries;
CREATE POLICY "anon_update_leaderboard" ON leaderboard_entries FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_leaderboard" ON leaderboard_entries;
CREATE POLICY "anon_delete_leaderboard" ON leaderboard_entries FOR DELETE
  TO anon, authenticated USING (true);

-- Mastery checks
CREATE TABLE IF NOT EXISTS mastery_checks (
  id text PRIMARY KEY,
  topic text NOT NULL,
  question text NOT NULL,
  options text[] NOT NULL,
  correct_index integer NOT NULL,
  xp_reward integer NOT NULL DEFAULT 30
);

ALTER TABLE mastery_checks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_mastery" ON mastery_checks;
CREATE POLICY "anon_select_mastery" ON mastery_checks FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_mastery" ON mastery_checks;
CREATE POLICY "anon_insert_mastery" ON mastery_checks FOR INSERT
  TO anon, authenticated WITH CHECK (true);

-- Seed: player_state
INSERT INTO player_state (id, xp, level, streak)
VALUES (1, 0, 1, 0)
ON CONFLICT (id) DO NOTHING;

-- Seed: badges
INSERT INTO badges (id, name, description, icon, color, xp_threshold) VALUES
  ('first-steps', 'First Steps', 'Complete your first gate puzzle', 'Footprints', '#00d4aa', 50),
  ('gate-master', 'Gate Master', 'Master all logic gates', 'Cpu', '#2fe0c0', 200),
  ('circuit-architect', 'Circuit Architect', 'Build a 5-gate circuit', 'Workflow', '#60a5fa', 400),
  ('wave-rider', 'Wave Rider', 'Complete the waveform lab', 'Waves', '#fbbf24', 300),
  ('power-saver', 'Power Saver', 'Solve 3 power optimization puzzles', 'Zap', '#f97316', 500),
  ('state-explorer', 'State Explorer', 'Navigate all FSM states', 'GitBranch', '#a78bfa', 600),
  ('cpu-slayer', 'CPU Slayer', 'Defeat the CPU boss', 'Trophy', '#ef4444', 1000),
  ('streak-7', 'Week Warrior', 'Maintain a 7-day streak', 'Flame', '#f97316', 350)
ON CONFLICT (id) DO NOTHING;

-- Seed: quests
INSERT INTO quests (id, title, description, xp_reward, icon) VALUES
  ('q1', 'Gate Keeper', 'Solve 5 logic gate puzzles in a row', 100, 'puzzle'),
  ('q2', 'Signal Master', 'Complete the waveform timing challenge', 150, 'waves'),
  ('q3', 'Circuit Sprint', 'Build a circuit with at least 4 gates', 200, 'cpu'),
  ('q4', 'Efficiency Expert', 'Simplify 3 Boolean expressions', 250, 'zap'),
  ('q5', 'Final Boss', 'Execute a complete CPU program', 500, 'trophy')
ON CONFLICT (id) DO NOTHING;

-- Seed: leaderboard
INSERT INTO leaderboard_entries (player_name, initials, xp, level, is_current_player) VALUES
  ('ByteSlayer', 'BS', 2840, 8, false),
  ('LogicLord', 'LL', 2210, 7, false),
  ('GateKeeper', 'GK', 1950, 6, false),
  ('CircuitQueen', 'CQ', 1680, 6, false),
  ('WaveRider', 'WR', 1320, 5, false),
  ('You', 'YOU', 0, 1, true),
  ('NewbieNick', 'NN', 320, 2, false),
  ('AlphaAce', 'AA', 150, 1, false)
ON CONFLICT (id) DO NOTHING;

-- Seed: mastery checks
INSERT INTO mastery_checks (id, topic, question, options, correct_index, xp_reward) VALUES
  ('mc1', 'Logic Gates', 'What is the output of an AND gate when both inputs are 1?', ARRAY['0', '1', 'Undefined', 'Both'], 1, 30),
  ('mc2', 'Logic Gates', 'Which gate outputs 1 only when inputs differ?', ARRAY['AND', 'OR', 'XOR', 'NAND'], 2, 30),
  ('mc3', 'Boolean Algebra', 'Simplify: A AND (A OR B)', ARRAY['A', 'B', 'A AND B', 'A OR B'], 0, 40),
  ('mc4', 'Sequential Logic', 'What does a D flip-flop do?', ARRAY['Stores 1 bit', 'Adds two numbers', 'Inverts input', 'Counts pulses'], 0, 40),
  ('mc5', 'Combinational Logic', 'A multiplexer with 3 select lines can choose from how many inputs?', ARRAY['4', '8', '16', '32'], 1, 50)
ON CONFLICT (id) DO NOTHING;
