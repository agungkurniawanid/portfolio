-- Migration file: supabase/migrations/20260306000002_create_deployed_projects_table.sql

-- ==========================================
-- 1. BUAT TABEL DEPLOYED PROJECTS
-- ==========================================
CREATE TABLE IF NOT EXISTS public.deployed_projects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    summary TEXT NOT NULL,
    description TEXT NOT NULL,
    thumbnail_url TEXT NOT NULL,
    gallery_urls TEXT[] DEFAULT '{}',
    platform TEXT NOT NULL, -- e.g., 'Web', 'Android', 'iOS', 'Cross-Platform'
    web_url TEXT,
    play_store_url TEXT,
    apk_file_path TEXT,
    external_apk_url TEXT,
    update_notes TEXT,
    tags TEXT[] DEFAULT '{}',
    published_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Mengaktifkan Row Level Security (RLS)
ALTER TABLE public.deployed_projects ENABLE ROW LEVEL SECURITY;

-- Akses baca untuk publik
DROP POLICY IF EXISTS "Allow public read access to deployed_projects" ON public.deployed_projects;
CREATE POLICY "Allow public read access to deployed_projects"
ON public.deployed_projects FOR SELECT
USING (true);

-- Akses penuh untuk authenticated admin (jika diperlukan untuk CMS)
DROP POLICY IF EXISTS "Allow authenticated full access to deployed_projects" ON public.deployed_projects;
CREATE POLICY "Allow authenticated full access to deployed_projects"
ON public.deployed_projects FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- ==========================================
-- 2. SETUP STORAGE BUCKET (SQL METHOD)
-- ==========================================
-- Opsional: Membuat bucket public 'project-files' via SQL jika schema storage diizinkan
INSERT INTO storage.buckets (id, name, public) 
VALUES ('project-files', 'project-files', true) 
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public Access project-files" ON storage.objects;
CREATE POLICY "Public Access project-files" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'project-files');