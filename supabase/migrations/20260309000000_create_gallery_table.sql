-- ============================================================
-- MIGRATION: Gallery — Photos & Albums
-- Date: 2026-03-09
-- Run in: Supabase Dashboard > SQL Editor
-- Idempotent (safe to re-run)
--
-- Tables:
--   • gallery_photos  — individual photo entries (personal or guest)
--   • gallery_albums  — album groupings
--
-- owner_type: 'personal' = Gallery Agung, 'guest' = Gallery Tamu
-- ============================================================

-- ──────────────────────────────────────────────────
-- 0. ENUM types
-- ──────────────────────────────────────────────────
DO $$ BEGIN
  CREATE TYPE gallery_owner_type AS ENUM ('personal', 'guest');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ──────────────────────────────────────────────────
-- 1. TABLE: gallery_photos
-- ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.gallery_photos (
  id              BIGSERIAL       PRIMARY KEY,
  title           VARCHAR(255)    NOT NULL,
  description     TEXT            NOT NULL DEFAULT '',
  location        VARCHAR(255)    NOT NULL DEFAULT '',
  date            DATE            NOT NULL,
  year            SMALLINT        GENERATED ALWAYS AS (EXTRACT(YEAR FROM date)::SMALLINT) STORED,
  category        VARCHAR(100)    NOT NULL,
  album           VARCHAR(255)    NOT NULL DEFAULT '',
  album_slug      VARCHAR(255)    NOT NULL DEFAULT '',
  device          VARCHAR(100)    NOT NULL DEFAULT '',
  image_url       TEXT            NOT NULL,
  thumbnail_url   TEXT            NOT NULL,
  width           INTEGER         NOT NULL DEFAULT 800,
  height          INTEGER         NOT NULL DEFAULT 600,
  is_featured     BOOLEAN         NOT NULL DEFAULT FALSE,
  tags            TEXT[]          NOT NULL DEFAULT '{}',
  owner_type      gallery_owner_type NOT NULL DEFAULT 'personal',
  is_approved     BOOLEAN         NOT NULL DEFAULT TRUE,   -- for guest photos, requires approval
  uploader_name   VARCHAR(100)    NULL,                   -- optional: name of guest uploader
  created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  public.gallery_photos                   IS 'Portfolio gallery photos — personal (Gallery Agung) or guest (Gallery Tamu).';
COMMENT ON COLUMN public.gallery_photos.owner_type        IS '"personal" = Gallery Agung owned by the site owner; "guest" = submitted by a visitor.';
COMMENT ON COLUMN public.gallery_photos.is_approved       IS 'Guest photos require approval before being shown publicly.';
COMMENT ON COLUMN public.gallery_photos.uploader_name     IS 'Display name of the guest who submitted the photo.';
COMMENT ON COLUMN public.gallery_photos.tags              IS 'Array of tag strings e.g. {pantai, sunset, bali}.';
COMMENT ON COLUMN public.gallery_photos.year              IS 'Auto-computed from date column.';

-- ──────────────────────────────────────────────────
-- 2. TABLE: gallery_albums
-- ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.gallery_albums (
  slug            VARCHAR(255)    PRIMARY KEY,
  name            VARCHAR(255)    NOT NULL,
  description     TEXT            NOT NULL DEFAULT '',
  category        VARCHAR(100)    NOT NULL,
  cover_url       TEXT            NOT NULL,
  period          VARCHAR(100)    NOT NULL DEFAULT '',
  photo_count     INTEGER         NOT NULL DEFAULT 0,
  owner_type      gallery_owner_type NOT NULL DEFAULT 'personal',
  created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  public.gallery_albums             IS 'Album groupings for gallery photos.';
COMMENT ON COLUMN public.gallery_albums.owner_type  IS '"personal" = Gallery Agung; "guest" = Gallery Tamu.';

-- ──────────────────────────────────────────────────
-- 3. INDEXES
-- ──────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_gallery_photos_owner_type   ON public.gallery_photos (owner_type);
CREATE INDEX IF NOT EXISTS idx_gallery_photos_category     ON public.gallery_photos (category);
CREATE INDEX IF NOT EXISTS idx_gallery_photos_is_approved  ON public.gallery_photos (is_approved);
CREATE INDEX IF NOT EXISTS idx_gallery_photos_date         ON public.gallery_photos (date DESC);
CREATE INDEX IF NOT EXISTS idx_gallery_photos_is_featured  ON public.gallery_photos (is_featured) WHERE is_featured = TRUE;
CREATE INDEX IF NOT EXISTS idx_gallery_albums_owner_type   ON public.gallery_albums (owner_type);

-- ──────────────────────────────────────────────────
-- 4. AUTO-UPDATE updated_at triggers
-- ──────────────────────────────────────────────────
DROP TRIGGER IF EXISTS update_gallery_photos_updated_at ON public.gallery_photos;
CREATE TRIGGER update_gallery_photos_updated_at
  BEFORE UPDATE ON public.gallery_photos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_gallery_albums_updated_at ON public.gallery_albums;
CREATE TRIGGER update_gallery_albums_updated_at
  BEFORE UPDATE ON public.gallery_albums
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ──────────────────────────────────────────────────
-- 5. ROW LEVEL SECURITY
-- ──────────────────────────────────────────────────
ALTER TABLE public.gallery_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_albums ENABLE ROW LEVEL SECURITY;

-- Public can view approved photos only
DROP POLICY IF EXISTS "gallery_photos_public_read" ON public.gallery_photos;
CREATE POLICY "gallery_photos_public_read"
  ON public.gallery_photos FOR SELECT
  USING (is_approved = TRUE);

-- Public can view all albums
DROP POLICY IF EXISTS "gallery_albums_public_read" ON public.gallery_albums;
CREATE POLICY "gallery_albums_public_read"
  ON public.gallery_albums FOR SELECT
  USING (true);

-- Guest photo submissions: anyone can insert (pending approval)
DROP POLICY IF EXISTS "gallery_photos_guest_insert" ON public.gallery_photos;
CREATE POLICY "gallery_photos_guest_insert"
  ON public.gallery_photos FOR INSERT
  WITH CHECK (owner_type = 'guest' AND is_approved = FALSE);

-- ──────────────────────────────────────────────────
-- 6. SEED: Sample personal photos from galleryData.ts
-- (Same data that was previously in static galleryData)
-- ──────────────────────────────────────────────────
INSERT INTO public.gallery_photos (title, description, location, date, category, album, album_slug, device, image_url, thumbnail_url, width, height, is_featured, tags, owner_type)
VALUES
  ('Sunset di Pantai Kuta', 'Momen sore hari yang tenang di tepi pantai saat matahari terbenam perlahan. Warna langit jingga bercampur ungu menciptakan pemandangan yang memukau.', 'Pantai Kuta, Bali', '2024-08-15', 'Travel & Wisata', 'Bali Trip 2024', 'bali-trip-2024', 'iPhone 13', 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&auto=format&fit=crop&q=80', 1200, 800, TRUE, ARRAY['pantai','sunset','bali','alam'], 'personal'),
  ('Pura Tanah Lot', 'Pura ikonik Bali yang berdiri megah di atas batu karang di tengah laut. Dikunjungi saat golden hour untuk mendapatkan foto terbaik.', 'Tanah Lot, Bali', '2024-08-16', 'Travel & Wisata', 'Bali Trip 2024', 'bali-trip-2024', 'iPhone 13', 'https://images.unsplash.com/photo-1604608672516-f97c8d4a4b8b?w=800&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1604608672516-f97c8d4a4b8b?w=400&auto=format&fit=crop&q=80', 800, 1000, FALSE, ARRAY['pura','bali','budaya','wisata'], 'personal'),
  ('Kawah Ijen Malam', 'Blue fire legendaris di Kawah Ijen yang hanya bisa dilihat saat malam hingga subuh. Perjalanan mendaki yang penuh perjuangan tapi sepadan.', 'Kawah Ijen, Banyuwangi', '2024-06-20', 'Travel & Wisata', 'Jawa Trip 2024', 'jawa-trip-2024', 'Canon EOS M50', 'https://images.unsplash.com/photo-1519681393784-d1b22dd8ba9e?w=800&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1519681393784-d1b22dd8ba9e?w=400&auto=format&fit=crop&q=80', 1200, 900, TRUE, ARRAY['gunung','kawah','alam','malam'], 'personal'),
  ('Sawah Tegalalang', 'Hamparan hijau persawahan berteras-teras di Ubud yang memanjakan mata. Berjalan di pematang sawah sambil menikmati udara segar.', 'Tegalalang, Ubud, Bali', '2024-08-17', 'Travel & Wisata', 'Bali Trip 2024', 'bali-trip-2024', 'iPhone 13', 'https://images.unsplash.com/photo-1537953773345-d172ccf13cf4?w=800&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1537953773345-d172ccf13cf4?w=400&auto=format&fit=crop&q=80', 900, 1200, FALSE, ARRAY['sawah','bali','hijau','alam'], 'personal'),
  ('Bromo di Pagi Hari', 'Lautan awan di bawah kaki dan semburat jingga matahari terbit dari kawah Bromo. Keindahan alam Indonesia yang tak tertandingi.', 'Gunung Bromo, Jawa Timur', '2023-09-10', 'Travel & Wisata', 'Bromo Trip 2023', 'bromo-trip-2023', 'Canon EOS M50', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&auto=format&fit=crop&q=80', 1400, 800, TRUE, ARRAY['gunung','bromo','sunrise','alam'], 'personal'),
  ('Pantai Nusa Penida', 'Tebing dramatis dan air laut biru jernih di Nusa Penida. Snorkeling dengan manta ray adalah pengalaman yang tak terlupakan.', 'Nusa Penida, Bali', '2023-07-05', 'Travel & Wisata', 'Bali Trip 2023', 'bali-trip-2023', 'GoPro Hero 10', 'https://images.unsplash.com/photo-1573790387438-4da905039392?w=800&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1573790387438-4da905039392?w=400&auto=format&fit=crop&q=80', 1200, 700, FALSE, ARRAY['pantai','laut','biru','alam'], 'personal'),
  ('Setup Workspace Baru', 'Akhirnya setup desk baru setelah lama nabung. Ultrawide monitor + mechanical keyboard combo yang bikin produktivitas naik drastis.', 'Kamar Kerja, Rumah', '2024-03-15', 'Coding & Workspace', 'Workspace Setup', 'workspace-setup', 'Samsung Galaxy S23', 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=800&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=400&auto=format&fit=crop&q=80', 1200, 800, TRUE, ARRAY['workspace','coding','setup','tech'], 'personal')
ON CONFLICT DO NOTHING;

-- ──────────────────────────────────────────────────
-- 7. SEED: Sample albums
-- ──────────────────────────────────────────────────
INSERT INTO public.gallery_albums (slug, name, description, category, cover_url, period, photo_count, owner_type)
VALUES
  ('bali-trip-2024', 'Bali Trip 2024', 'Perjalanan seru menjelajahi keindahan Bali — dari Kuta hingga Ubud.', 'Travel & Wisata', 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop&q=80', 'Agustus 2024', 3, 'personal'),
  ('jawa-trip-2024', 'Jawa Trip 2024', 'Petualangan di Pulau Jawa — Kawah Ijen, Bromo, dan lebih banyak lagi.', 'Travel & Wisata', 'https://images.unsplash.com/photo-1519681393784-d1b22dd8ba9e?w=600&auto=format&fit=crop&q=80', 'Juni 2024', 1, 'personal'),
  ('bromo-trip-2023', 'Bromo Trip 2023', 'Menyaksikan sunrise legendary di atas kawah Bromo.', 'Travel & Wisata', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&auto=format&fit=crop&q=80', 'September 2023', 1, 'personal'),
  ('workspace-setup', 'Workspace Setup', 'Evolusi setup kerja dari awal hingga sekarang.', 'Coding & Workspace', 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=600&auto=format&fit=crop&q=80', '2024', 1, 'personal')
ON CONFLICT DO NOTHING;
