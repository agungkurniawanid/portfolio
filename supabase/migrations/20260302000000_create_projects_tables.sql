-- ============================================================
-- MIGRATION: Projects System — Schema + Seed Data
-- Date: 2026-03-02
-- Run in: Supabase Dashboard > SQL Editor
-- Idempotent (safe to re-run)
--
-- TABLE RELATIONSHIPS:
--
--   projects  ──< project_github_urls  (1 project → many repo links)
--   projects  ──< project_images       (1 project → many gallery images)
--   projects  >──< popular_projects    (junction: picks ≤9 home-page slots)
--
-- DESIGN RATIONALE:
--   • popular_projects is a SEPARATE table (not a boolean column on projects).
--     This lets the portfolio owner freely swap popular projects, control their
--     display_order, and keep the master projects table clean.
--   • project_github_urls is a child table because one project can have multiple
--     repos (web, mobile, IoT, model AI, …).
--   • project_images is a child table to support a future image-gallery feature.
--     The main thumbnail_url sits on projects itself for fast single-row reads.
--   • tech_stack and platform_apps are stored as TEXT[] arrays — fast to read,
--     simple to filter, no join needed for the common case.
-- ============================================================

-- ──────────────────────────────────────────────────
-- 0. Enable extensions (idempotent)
-- ──────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ──────────────────────────────────────────────────
-- 1. TABLE: projects (master)
-- ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.projects (
  id              UUID        DEFAULT uuid_generate_v4() PRIMARY KEY,
  title           TEXT        NOT NULL,
  description     TEXT        NOT NULL,
  thumbnail_url   TEXT,                                         -- Supabase Storage public URL
  platform_apps   TEXT[]      DEFAULT '{}',                    -- ['Web App','Mobile App','IoT Device']
  tech_stack      TEXT[]      DEFAULT '{}',                    -- ['Laravel','Flutter',…]
  live_url        TEXT,                                         -- live demo (NULL if none)
  github_api      TEXT,                                         -- GitHub API URL for live star-count
  category        TEXT        NOT NULL DEFAULT 'personal'
                  CHECK (category IN ('personal','academic','freelance','company')),
  year            SMALLINT,                                     -- year project was built / published
  is_published    BOOLEAN     NOT NULL DEFAULT true,            -- false = draft / soft-deleted
  display_order   SMALLINT    NOT NULL DEFAULT 0,               -- optional manual sort within a category
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ──────────────────────────────────────────────────
-- 2. TABLE: project_github_urls (child — 1:N)
--    One project can link to multiple repos.
-- ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.project_github_urls (
  id              UUID        DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id      UUID        NOT NULL
                    REFERENCES public.projects(id) ON DELETE CASCADE,
  label           TEXT        NOT NULL,   -- 'web' | 'mobile' | 'iot' | 'model AI' | …
  url             TEXT        NOT NULL,
  display_order   SMALLINT    NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ──────────────────────────────────────────────────
-- 3. TABLE: project_images (child — 1:N)
--    Gallery support for the future detail/modal view.
--    The primary thumbnail stays on projects.thumbnail_url
--    for fast reads without a join.
-- ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.project_images (
  id              UUID        DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id      UUID        NOT NULL
                    REFERENCES public.projects(id) ON DELETE CASCADE,
  image_url       TEXT        NOT NULL,   -- Supabase Storage public URL
  alt_text        TEXT,
  display_order   SMALLINT    NOT NULL DEFAULT 0,
  is_thumbnail    BOOLEAN     NOT NULL DEFAULT false,  -- mirrors projects.thumbnail_url for gallery queries
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ──────────────────────────────────────────────────
-- 4. TABLE: popular_projects (junction — N:1)
--    Decoupled control over which projects appear in
--    the Home page "Popular Projects" section (max 9).
--    display_order (0–8) drives the card layout order.
-- ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.popular_projects (
  id              UUID        DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id      UUID        NOT NULL UNIQUE
                    REFERENCES public.projects(id) ON DELETE CASCADE,
  display_order   SMALLINT    NOT NULL DEFAULT 0
                    CHECK (display_order >= 0),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ──────────────────────────────────────────────────
-- 5. INDEXES
-- ──────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_projects_published
  ON public.projects(is_published)
  WHERE is_published = true;

CREATE INDEX IF NOT EXISTS idx_projects_category
  ON public.projects(category);

CREATE INDEX IF NOT EXISTS idx_projects_year
  ON public.projects(year);

CREATE INDEX IF NOT EXISTS idx_project_github_urls_project_id
  ON public.project_github_urls(project_id);

CREATE INDEX IF NOT EXISTS idx_project_images_project_id
  ON public.project_images(project_id);

CREATE INDEX IF NOT EXISTS idx_popular_projects_order
  ON public.popular_projects(display_order ASC);

CREATE INDEX IF NOT EXISTS idx_popular_projects_project_id
  ON public.popular_projects(project_id);

-- ──────────────────────────────────────────────────
-- 6. AUTO-UPDATE updated_at trigger
--    Reuses the same function created by the guestbook migration.
-- ──────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_projects_updated_at ON public.projects;
CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ──────────────────────────────────────────────────
-- 7. ROW LEVEL SECURITY
-- ──────────────────────────────────────────────────
ALTER TABLE public.projects            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_github_urls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_images      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.popular_projects    ENABLE ROW LEVEL SECURITY;

-- Drop then recreate (idempotent)
DROP POLICY IF EXISTS "projects_public_read"       ON public.projects;
DROP POLICY IF EXISTS "project_github_public_read" ON public.project_github_urls;
DROP POLICY IF EXISTS "project_images_public_read" ON public.project_images;
DROP POLICY IF EXISTS "popular_projects_public_read" ON public.popular_projects;

-- All four tables are read-only for the public (portfolio is read-only for visitors)
CREATE POLICY "projects_public_read"
  ON public.projects FOR SELECT
  USING (is_published = true);

CREATE POLICY "project_github_public_read"
  ON public.project_github_urls FOR SELECT
  USING (true);

CREATE POLICY "project_images_public_read"
  ON public.project_images FOR SELECT
  USING (true);

CREATE POLICY "popular_projects_public_read"
  ON public.popular_projects FOR SELECT
  USING (true);

-- ──────────────────────────────────────────────────
-- 8. STORAGE: project-thumbnails bucket
-- ──────────────────────────────────────────────────
INSERT INTO storage.buckets (id, name, public)
VALUES ('project-thumbnails', 'project-thumbnails', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "project_thumbnails_public_read"  ON storage.objects;
DROP POLICY IF EXISTS "project_thumbnails_admin_upload" ON storage.objects;
DROP POLICY IF EXISTS "project_thumbnails_admin_delete" ON storage.objects;

CREATE POLICY "project_thumbnails_public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'project-thumbnails');

CREATE POLICY "project_thumbnails_admin_upload"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'project-thumbnails');

CREATE POLICY "project_thumbnails_admin_delete"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'project-thumbnails');

-- ──────────────────────────────────────────────────
-- 9. SEED: 9 Popular Projects (from existing static data)
--
--    NOTE: thumbnail_url values are set to NULL here.
--    After uploading images to the 'project-thumbnails'
--    Supabase Storage bucket, update them with:
--
--      UPDATE public.projects
--      SET thumbnail_url = '<supabase-public-url>'
--      WHERE id = '<project-uuid>';
--
--    Public URL pattern:
--      https://<project-ref>.supabase.co/storage/v1/object/public/project-thumbnails/<filename>
-- ──────────────────────────────────────────────────

-- 9a. Insert master project rows (ON CONFLICT DO NOTHING = idempotent)
INSERT INTO public.projects
  (id, title, description, platform_apps, tech_stack, live_url, github_api, category, year, display_order)
VALUES
  (
    'a0000000-0000-0000-0000-000000000001',
    'Intelligence Quality Air Control System Greenhouse Kopi Nrsery App',
    'Menggabungkan Situs Web, Aplikasi Seluler, dan IoT. Proyek ini merupakan sistem kontrol kualitas udara berbasis kecerdasan buatan yang dirancang khusus untuk pembibitan kopi. Sistem ini bertujuan untuk memantau, menganalisis, dan mengontrol udara serta mendiagnosis penyakit kopi melalui aplikasi seluler dengan deep learning CNN.',
    ARRAY['Web App', 'Mobile App', 'IoT Device'],
    ARRAY['Laravel', 'Flutter', 'Python', 'Tensorflow', 'FastAPI', 'Convolutional Neural Network', 'Deep Learning'],
    NULL, NULL, 'academic', 2024, 0
  ),
  (
    'a0000000-0000-0000-0000-000000000002',
    'Emotional Faces Classification',
    'Sebuah aplikasi yang dibuat untuk memberikan kesimpulan pada foto yang diupload dengan beberapa ekspresi yang akan didapatkan seperti marah, sedih dan lain-lain. Aplikasi ini dibuat dengan Flutter untuk App, Nextjs dan Fast API untuk backend, dan metode deep learning yaitu Convolutional Neural Network.',
    ARRAY['Web App', 'Mobile App'],
    ARRAY['Flutter', 'Laravel', 'FastAPI', 'TailwindCSS', 'MySQL', 'Python', 'Convolutional Neural Network', 'Deep Learning', 'Tensorflow'],
    NULL, NULL, 'academic', 2024, 1
  ),
  (
    'a0000000-0000-0000-0000-000000000003',
    'Marketplace KampSewa: Jual Beli, Sewa dan Menyewakan Alat Kamping App',
    'Aplikasi yang menyediakan penyewaan & penyewaan peralatan berkemah ke seluruh wilayah yang memungkinkan pengguna untuk saling menyewakan dan menyewakan peralatan berkemah mereka.',
    ARRAY['Web App', 'Mobile App'],
    ARRAY['Laravel', 'Flutter', 'TailwindCSS', 'MySQL', 'Midtrans'],
    NULL, NULL, 'personal', 2023, 2
  ),
  (
    'a0000000-0000-0000-0000-000000000004',
    'Speech to Speech With AI ElevenLabs App',
    'Sebuah aplikasi di mana pengguna dapat melakukan percakapan dua arah dengan AI, speech to speech dalam aplikasi ini dilakukan secara Real-Time. Dibangun dengan API Gemini dan ElevenLabs AI.',
    ARRAY['Mobile App'],
    ARRAY['Flutter', 'Gemini API', 'ElevenLabs AI'],
    NULL, NULL, 'personal', 2024, 3
  ),
  (
    'a0000000-0000-0000-0000-000000000005',
    'Dapnetwork (Old Version) App',
    'Aplikasi DAPNetwork, yang dikembangkan oleh DAPNetwork, membuat manajemen jaringan internet menjadi mudah. Aplikasi ini mencakup platform seluler bagi staf untuk menangani penagihan dan pemasangan pelanggan baru, dan situs web bagi admin untuk mengelola operasi melalui dasbor yang komprehensif.',
    ARRAY['Web App', 'Mobile App'],
    ARRAY['Java Native', 'PHP Native', 'TailwindCSS', 'MySQL'],
    NULL, NULL, 'freelance', 2023, 4
  ),
  (
    'a0000000-0000-0000-0000-000000000006',
    'Clock App',
    'Clock App adalah aplikasi canggih yang dirancang untuk memberikan pengalaman pengguna terbaik dalam mengelola waktu.',
    ARRAY['Mobile App'],
    ARRAY['Flutter'],
    NULL, NULL, 'personal', 2023, 5
  ),
  (
    'a0000000-0000-0000-0000-000000000007',
    'Electro Mart App',
    'Aplikasi E-Commerce untuk menjual peralatan elektronik seperti Laptop, Komputer, TV dan lain-lain. Dibuat dengan Flutter untuk aplikasi mobile dan Nextjs untuk aplikasi website.',
    ARRAY['Web App', 'Mobile App'],
    ARRAY['Flutter', 'Next.js', 'MySQL', 'TailwindCSS'],
    NULL, NULL, 'personal', 2023, 6
  ),
  (
    'a0000000-0000-0000-0000-000000000008',
    'QR Code Reader App',
    'QRCode Reader adalah aplikasi yang memungkinkan pengguna untuk memindai dan membaca kode QR dengan cepat dan efisien. Aplikasi ini mendukung berbagai jenis konten yang dikodekan dalam QR, seperti URL, teks, kontak, dan informasi lainnya.',
    ARRAY['Mobile App'],
    ARRAY['Flutter'],
    NULL, NULL, 'personal', 2023, 7
  ),
  (
    'a0000000-0000-0000-0000-000000000009',
    'HandyCraft App',
    'Aplikasi untuk UMKM yang bergerak di bidang usaha kerajinan dan perkakas, aplikasi ini berisi sistem yang dapat mengatur transaksi, keuangan seperti pemasukan dan pengeluaran serta pemasukan dari supplier. Dan integrasi Firebase.',
    ARRAY['Mobile App'],
    ARRAY['Flutter', 'Firebase'],
    NULL, NULL, 'freelance', 2024, 8
  )
ON CONFLICT (id) DO NOTHING;

-- 9b. GitHub repo URLs for each project
INSERT INTO public.project_github_urls (project_id, label, url, display_order)
VALUES
  -- Greenhouse project (id 001)
  ('a0000000-0000-0000-0000-000000000001', 'web',      'https://github.com/agungkurniawanid/kopi_greenhouse_aircontrol_web',                  0),
  ('a0000000-0000-0000-0000-000000000001', 'mobile',   'https://github.com/agungkurniawanid/kopi_greenhouse_aircontrol_app',                  1),
  ('a0000000-0000-0000-0000-000000000001', 'model AI', 'https://github.com/agungkurniawanid/kopi_greenhouse_aircontrol_coffee_leaf_model',     2),
  ('a0000000-0000-0000-0000-000000000001', 'iot',      'https://github.com/agungkurniawanid/kopi_greenhouse_aircontrol_iot',                  3),
  -- Emotional Faces (id 002)
  ('a0000000-0000-0000-0000-000000000002', 'web',      'https://github.com/agungkurniawanid/emotional_faces_classification_web',              0),
  ('a0000000-0000-0000-0000-000000000002', 'mobile',   'https://github.com/agungkurniawanid/emotional_faces_classification_app',              1),
  -- KampSewa (id 003)
  ('a0000000-0000-0000-0000-000000000003', 'web',      'https://github.com/agungkurniawanid/marketplace_kampsewa_web',                       0),
  ('a0000000-0000-0000-0000-000000000003', 'mobile',   'https://github.com/agungkurniawanid/marketplace_kampsewa_app',                       1),
  -- Speech-to-Speech (id 004)
  ('a0000000-0000-0000-0000-000000000004', 'mobile',   'https://github.com/agungkurniawanid/speech_to_speech_ai_evenlabs_app',               0),
  -- Dapnetwork (id 005)
  ('a0000000-0000-0000-0000-000000000005', 'web',      'https://github.com/agungkurniawanid/dapnetwork_web',                                 0),
  ('a0000000-0000-0000-0000-000000000005', 'mobile',   'https://github.com/agungkurniawanid/dapnetwork_old_app',                             1),
  -- Clock App (id 006)
  ('a0000000-0000-0000-0000-000000000006', 'mobile',   'https://github.com/agungkurniawanid/clock_app',                                      0),
  -- Electro Mart (id 007)
  ('a0000000-0000-0000-0000-000000000007', 'web',      'https://github.com/agungkurniawanid/electro_mart_web',                               0),
  ('a0000000-0000-0000-0000-000000000007', 'mobile',   'https://github.com/agungkurniawanid/electro_mart_app',                               1),
  -- QR Code (id 008)
  ('a0000000-0000-0000-0000-000000000008', 'mobile',   'https://github.com/agungkurniawanid/qrcode_reader_app',                              0),
  -- HandyCraft (id 009)
  ('a0000000-0000-0000-0000-000000000009', 'mobile',   'https://github.com/agungkurniawanid/handycraft_app',                                 0)
ON CONFLICT DO NOTHING;

-- 9c. Register all 9 as popular projects (Home page section)
INSERT INTO public.popular_projects (project_id, display_order)
VALUES
  ('a0000000-0000-0000-0000-000000000001', 0),
  ('a0000000-0000-0000-0000-000000000002', 1),
  ('a0000000-0000-0000-0000-000000000003', 2),
  ('a0000000-0000-0000-0000-000000000004', 3),
  ('a0000000-0000-0000-0000-000000000005', 4),
  ('a0000000-0000-0000-0000-000000000006', 5),
  ('a0000000-0000-0000-0000-000000000007', 6),
  ('a0000000-0000-0000-0000-000000000008', 7),
  ('a0000000-0000-0000-0000-000000000009', 8)
ON CONFLICT (project_id) DO NOTHING;

-- ──────────────────────────────────────────────────
-- EXAMPLE QUERY — Fetch 9 Popular Projects for Home page
-- ──────────────────────────────────────────────────
--
-- SELECT
--   p.id,
--   p.title,
--   p.description,
--   p.thumbnail_url,
--   p.platform_apps,
--   p.tech_stack,
--   p.live_url,
--   p.github_api,
--   pp.display_order,
--   json_agg(
--     json_build_object('label', gu.label, 'url', gu.url)
--     ORDER BY gu.display_order
--   ) FILTER (WHERE gu.id IS NOT NULL) AS github_urls
-- FROM public.popular_projects pp
-- JOIN  public.projects p
--   ON  p.id = pp.project_id
--   AND p.is_published = true
-- LEFT JOIN public.project_github_urls gu
--   ON gu.project_id = p.id
-- GROUP BY p.id, pp.display_order
-- ORDER BY pp.display_order ASC
-- LIMIT 9;
--
-- ──────────────────────────────────────────────────
-- Done. Verify with:
--   SELECT count(*) FROM public.projects;          -- should be 9
--   SELECT count(*) FROM public.popular_projects;  -- should be 9
--   SELECT count(*) FROM public.project_github_urls; -- should be 16
-- ──────────────────────────────────────────────────
