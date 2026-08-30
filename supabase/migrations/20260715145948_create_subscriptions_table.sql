/*
# Create subscriptions table for offline access and premium features

1. New Tables
- `subscriptions`
  - `id` (uuid, primary key)
  - `user_id` (uuid, not null, defaults to auth.uid(), references auth.users)
  - `plan` (text, not null: 'free', 'pro', 'campus')
  - `status` (text, not null: 'active', 'canceled', 'expired')
  - `offline_enabled` (boolean, default false — true for pro/campus)
  - `started_at` (timestamptz, default now())
  - `expires_at` (timestamptz, nullable — null means no expiry)
  - `created_at` (timestamptz, default now())
  - `updated_at` (timestamptz, default now())

2. Security
- Enable RLS on `subscriptions`.
- Owner-scoped CRUD: each authenticated user can only access their own subscription.
- SELECT, INSERT, UPDATE, DELETE policies scoped to auth.uid() = user_id.
*/

CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  plan text NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'campus')),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'canceled', 'expired')),
  offline_enabled boolean NOT NULL DEFAULT false,
  started_at timestamptz DEFAULT now(),
  expires_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_sub" ON subscriptions;
CREATE POLICY "select_own_sub" ON subscriptions FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_sub" ON subscriptions;
CREATE POLICY "insert_own_sub" ON subscriptions FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_sub" ON subscriptions;
CREATE POLICY "update_own_sub" ON subscriptions FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_sub" ON subscriptions;
CREATE POLICY "delete_own_sub" ON subscriptions FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- Index for fast lookup by user
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
