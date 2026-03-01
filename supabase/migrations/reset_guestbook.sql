-- ============================================================
-- GUESTBOOK FULL RESET MIGRATION
-- Hapus semua data lama & buat ulang dari nol dengan schema terbaru
-- Jalankan via: node scripts/migrate-guestbook.mjs
-- ============================================================

-- ─── 1. Clean up dependent objects ────────────────────────────────────────────
DROP TRIGGER IF EXISTS update_guestbook_updated_at ON guestbook;
DROP POLICY IF EXISTS "Public can view approved guestbook entries" ON guestbook;
DROP POLICY IF EXISTS "Anyone can insert guestbook entry" ON guestbook;

-- ─── 2. Drop & recreate table (data bersih total) ─────────────────────────────
DROP TABLE IF EXISTS guestbook CASCADE;

-- ─── 3. UUID extension ────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── 4. Create guestbook table (schema terbaru) ───────────────────────────────
CREATE TABLE guestbook (
  id                  UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  browser_fingerprint VARCHAR(64)  NOT NULL UNIQUE,
  name                VARCHAR(100) NOT NULL,
  city                VARCHAR(100) NOT NULL,
  profession          VARCHAR(100) NOT NULL,
  message             TEXT         NOT NULL,
  mood                VARCHAR(20)  NOT NULL,
  rating              INTEGER      NOT NULL CHECK (rating >= 1 AND rating <= 5),
  card_color          VARCHAR(20)  NOT NULL DEFAULT '#6366f1',
  avatar_url          VARCHAR(500) NULL,
  contact             VARCHAR(100) NULL,
  referral_source     VARCHAR(50)  NOT NULL,
  is_approved         BOOLEAN      DEFAULT true,
  created_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ─── 5. Indexes ───────────────────────────────────────────────────────────────
CREATE INDEX idx_guestbook_created_at   ON guestbook(created_at DESC);
CREATE INDEX idx_guestbook_fingerprint  ON guestbook(browser_fingerprint);
CREATE INDEX idx_guestbook_rating       ON guestbook(rating);
CREATE INDEX idx_guestbook_mood         ON guestbook(mood);
CREATE INDEX idx_guestbook_contact      ON guestbook(contact) WHERE contact IS NOT NULL;

-- ─── 6. Row Level Security ────────────────────────────────────────────────────
ALTER TABLE guestbook ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view approved guestbook entries"
  ON guestbook FOR SELECT
  USING (is_approved = true);

CREATE POLICY "Anyone can insert guestbook entry"
  ON guestbook FOR INSERT
  WITH CHECK (
    NOT EXISTS (
      SELECT 1 FROM guestbook AS existing
      WHERE existing.browser_fingerprint = browser_fingerprint
    )
  );

-- ─── 7. Auto-update updated_at trigger ────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_guestbook_updated_at
  BEFORE UPDATE ON guestbook
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ─── 8. Realtime ──────────────────────────────────────────────────────────────
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'guestbook'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE guestbook;
  END IF;
END $$;

-- ─── 9. Storage bucket: guestbook-avatars ─────────────────────────────────────
INSERT INTO storage.buckets (id, name, public)
VALUES ('guestbook-avatars', 'guestbook-avatars', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Drop lama dulu (idempotent)
DROP POLICY IF EXISTS "Public read guestbook avatar"          ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload guestbook avatar"    ON storage.objects;
DROP POLICY IF EXISTS "Anyone can delete own guestbook avatar" ON storage.objects;

CREATE POLICY "Public read guestbook avatar"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'guestbook-avatars');

CREATE POLICY "Anyone can upload guestbook avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'guestbook-avatars');

CREATE POLICY "Anyone can delete own guestbook avatar"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'guestbook-avatars');

-- ─── Done ─────────────────────────────────────────────────────────────────────
-- Verifikasi: SELECT column_name FROM information_schema.columns
--             WHERE table_name = 'guestbook' ORDER BY ordinal_position;
