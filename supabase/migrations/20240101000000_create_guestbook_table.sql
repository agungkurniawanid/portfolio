-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing dependent objects only if table exists (idempotent re-run)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'guestbook') THEN
    DROP TRIGGER IF EXISTS update_guestbook_updated_at ON guestbook;
    DROP POLICY IF EXISTS "Public can view approved guestbook entries" ON guestbook;
    DROP POLICY IF EXISTS "Anyone can insert guestbook entry" ON guestbook;
  END IF;
END $$;

-- Create guestbook table (idempotent)
CREATE TABLE IF NOT EXISTS guestbook (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  browser_fingerprint VARCHAR(64) NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  city VARCHAR(100) NOT NULL,
  profession VARCHAR(100) NOT NULL,
  message TEXT NOT NULL,
  mood VARCHAR(20) NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  card_color VARCHAR(20) NOT NULL DEFAULT '#6366f1',
  avatar_url VARCHAR(500) NULL,
  referral_source VARCHAR(50) NOT NULL,
  is_approved BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index untuk performa query
CREATE INDEX IF NOT EXISTS idx_guestbook_created_at ON guestbook(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_guestbook_fingerprint ON guestbook(browser_fingerprint);
CREATE INDEX IF NOT EXISTS idx_guestbook_rating ON guestbook(rating);
CREATE INDEX IF NOT EXISTS idx_guestbook_mood ON guestbook(mood);

-- Enable Row Level Security
ALTER TABLE guestbook ENABLE ROW LEVEL SECURITY;

-- Policy: semua orang bisa baca entry yang approved
CREATE POLICY "Public can view approved guestbook entries"
  ON guestbook FOR SELECT
  USING (is_approved = true);

-- Policy: semua orang bisa insert tapi hanya 1x per fingerprint
CREATE POLICY "Anyone can insert guestbook entry"
  ON guestbook FOR INSERT
  WITH CHECK (
    NOT EXISTS (
      SELECT 1 FROM guestbook AS existing
      WHERE existing.browser_fingerprint = browser_fingerprint
    )
  );

-- Function untuk auto update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger updated_at
CREATE TRIGGER update_guestbook_updated_at
  BEFORE UPDATE ON guestbook
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Realtime untuk live update tanpa reload
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'guestbook'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE guestbook;
  END IF;
END $$;

-- Storage bucket untuk avatar (jalankan di Supabase Dashboard jika belum ada)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('guestbook-avatars', 'guestbook-avatars', true);
-- CREATE POLICY "Public read avatar" ON storage.objects FOR SELECT USING (bucket_id = 'guestbook-avatars');
-- CREATE POLICY "Anyone can upload avatar" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'guestbook-avatars');
