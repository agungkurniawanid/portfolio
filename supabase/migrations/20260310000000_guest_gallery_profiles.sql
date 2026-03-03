-- ============================================================
-- MIGRATION: Gallery Tamu — Guest Profiles + Guest Albums/Photos
-- Tanggal: 2026-03-10
-- Jalankan: node scripts/migrate-guest-gallery.mjs
--           ATAU via POST /api/gallery/migrate (dev only)
-- Aman dijalankan berulang (idempotent)
--
-- Menambahkan:
--   • gallery_guests  — profil pengunjung/tamu
--   • guest_id column ke gallery_photos dan gallery_albums
--   • Supabase Storage buckets: gallery-guests, gallery-photos
--   • RLS policies
-- ============================================================

-- ──────────────────────────────────────────────────────────────
-- 1. TABLE: gallery_guests (profil tamu)
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.gallery_guests (
  id                    BIGSERIAL       PRIMARY KEY,
  name                  VARCHAR(100)    NOT NULL,
  avatar_url            TEXT            NULL,
  browser_fingerprint   VARCHAR(256)    NOT NULL UNIQUE,
  ip_address            VARCHAR(50)     NULL,
  album_count           INTEGER         NOT NULL DEFAULT 0,
  photo_count           INTEGER         NOT NULL DEFAULT 0,
  created_at            TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  public.gallery_guests                       IS 'Profil pengunjung yang mengupload foto ke Gallery Tamu.';
COMMENT ON COLUMN public.gallery_guests.browser_fingerprint   IS 'Browser fingerprint (SHA-256) untuk identifikasi unik. Satu tamu = satu registrasi.';
COMMENT ON COLUMN public.gallery_guests.album_count           IS 'Jumlah album milik tamu ini.';
COMMENT ON COLUMN public.gallery_guests.photo_count           IS 'Jumlah foto yang diupload tamu ini.';

-- ──────────────────────────────────────────────────────────────
-- 2. Tambah guest_id ke gallery_photos
-- ──────────────────────────────────────────────────────────────
ALTER TABLE public.gallery_photos
  ADD COLUMN IF NOT EXISTS guest_id BIGINT NULL
    REFERENCES public.gallery_guests(id) ON DELETE SET NULL;

COMMENT ON COLUMN public.gallery_photos.guest_id IS 'Referensi ke profil tamu yang mengupload foto ini.';

-- ──────────────────────────────────────────────────────────────
-- 3. Tambah guest_id ke gallery_albums
-- ──────────────────────────────────────────────────────────────
ALTER TABLE public.gallery_albums
  ADD COLUMN IF NOT EXISTS guest_id BIGINT NULL
    REFERENCES public.gallery_guests(id) ON DELETE CASCADE;

COMMENT ON COLUMN public.gallery_albums.guest_id IS 'Referensi ke profil tamu pemilik album ini.';

-- ──────────────────────────────────────────────────────────────
-- 4. Indexes
-- ──────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_gallery_guests_fingerprint  ON public.gallery_guests (browser_fingerprint);
CREATE INDEX IF NOT EXISTS idx_gallery_guests_name         ON public.gallery_guests (name);
CREATE INDEX IF NOT EXISTS idx_gallery_photos_guest_id     ON public.gallery_photos (guest_id);
CREATE INDEX IF NOT EXISTS idx_gallery_albums_guest_id     ON public.gallery_albums (guest_id);

-- ──────────────────────────────────────────────────────────────
-- 5. RLS: gallery_guests
-- ──────────────────────────────────────────────────────────────
ALTER TABLE public.gallery_guests ENABLE ROW LEVEL SECURITY;

-- Siapapun bisa baca daftar tamu (untuk directory A-Z)
DROP POLICY IF EXISTS "gallery_guests_public_read" ON public.gallery_guests;
CREATE POLICY "gallery_guests_public_read"
  ON public.gallery_guests FOR SELECT
  USING (true);

-- Siapapun bisa daftar (satu kali, dikontrol via fingerprint unik)
DROP POLICY IF EXISTS "gallery_guests_public_insert" ON public.gallery_guests;
CREATE POLICY "gallery_guests_public_insert"
  ON public.gallery_guests FOR INSERT
  WITH CHECK (true);

-- ──────────────────────────────────────────────────────────────
-- 6. Update RLS: gallery_albums — izinkan tamu insert album
-- ──────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "gallery_albums_guest_insert" ON public.gallery_albums;
CREATE POLICY "gallery_albums_guest_insert"
  ON public.gallery_albums FOR INSERT
  WITH CHECK (owner_type = 'guest');

-- ──────────────────────────────────────────────────────────────
-- 7. Update RLS: gallery_photos — izinkan tamu insert foto (pending approval)
-- ──────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "gallery_photos_guest_insert" ON public.gallery_photos;
CREATE POLICY "gallery_photos_guest_insert"
  ON public.gallery_photos FOR INSERT
  WITH CHECK (owner_type = 'guest');

-- ──────────────────────────────────────────────────────────────
-- 8. Storage bucket: gallery-guests (untuk foto profil tamu)
-- ──────────────────────────────────────────────────────────────
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'gallery-guests',
  'gallery-guests',
  true,
  5242880,  -- 5 MB max
  ARRAY['image/jpeg', 'image/png', 'image/webp']
) ON CONFLICT (id) DO UPDATE SET public = true;

-- Drop & recreate storage policies (gallery-guests)
DROP POLICY IF EXISTS "gallery-guests: public read"   ON storage.objects;
DROP POLICY IF EXISTS "gallery-guests: public insert" ON storage.objects;

CREATE POLICY "gallery-guests: public read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'gallery-guests');

CREATE POLICY "gallery-guests: public insert"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'gallery-guests');

-- ──────────────────────────────────────────────────────────────
-- 9. Storage bucket: gallery-photos (untuk foto gallery tamu)
-- ──────────────────────────────────────────────────────────────
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'gallery-photos',
  'gallery-photos',
  true,
  15728640,  -- 15 MB max
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
) ON CONFLICT (id) DO UPDATE SET public = true;

-- Drop & recreate storage policies (gallery-photos)
DROP POLICY IF EXISTS "gallery-photos: public read"   ON storage.objects;
DROP POLICY IF EXISTS "gallery-photos: public insert" ON storage.objects;

CREATE POLICY "gallery-photos: public read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'gallery-photos');

CREATE POLICY "gallery-photos: public insert"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'gallery-photos');

-- ──────────────────────────────────────────────────────────────
-- Done!
-- Verifikasi:
--   SELECT * FROM public.gallery_guests LIMIT 5;
--   SELECT column_name FROM information_schema.columns
--     WHERE table_name = 'gallery_photos' AND column_name = 'guest_id';
-- ──────────────────────────────────────────────────────────────
