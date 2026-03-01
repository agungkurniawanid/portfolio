-- ============================================================
-- MIGRATION: Guestbook — Add contact column + fix storage bucket
-- Tanggal: 2026-03-01
-- Jalankan di Supabase Dashboard > SQL Editor
-- Aman dijalankan berulang (idempotent)
-- ============================================================

-- 1. Tambah kolom contact (Instagram / WhatsApp) jika belum ada
ALTER TABLE guestbook
  ADD COLUMN IF NOT EXISTS contact VARCHAR(100) NULL;

COMMENT ON COLUMN guestbook.contact IS 'Instagram handle (@username) atau nomor WhatsApp — opsional';

-- 2. Index opsional untuk pencarian by contact
CREATE INDEX IF NOT EXISTS idx_guestbook_contact ON guestbook(contact)
  WHERE contact IS NOT NULL;

-- ============================================================
-- 3. Storage bucket: guestbook-avatars
--    (buat jika belum ada, aktifkan public access)
-- ============================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('guestbook-avatars', 'guestbook-avatars', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 4. Drop lalu recreate storage policies (idempotent)
DROP POLICY IF EXISTS "Public read guestbook avatar" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload guestbook avatar" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can delete own guestbook avatar" ON storage.objects;

-- Siapapun bisa baca avatar (public bucket)
CREATE POLICY "Public read guestbook avatar"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'guestbook-avatars');

-- Siapapun bisa upload avatar ke bucket ini
CREATE POLICY "Anyone can upload guestbook avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'guestbook-avatars');

-- Siapapun bisa hapus avatar dari bucket ini (cleanup)
CREATE POLICY "Anyone can delete own guestbook avatar"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'guestbook-avatars');

-- ============================================================
-- Done. Verifikasi:
--   SELECT column_name FROM information_schema.columns
--   WHERE table_name = 'guestbook' AND column_name = 'contact';
-- ============================================================
