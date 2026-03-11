-- ============================================================
-- SUPABASE MIGRATION: Blog System (v2 — dengan author_avatar)
-- Jalankan SQL ini di Supabase Dashboard > SQL Editor
-- PERHATIAN: Script ini akan DROP tabel lama dan membuat ulang.
--            Backup data terlebih dahulu jika ada data penting!
-- ============================================================

-- 0. Drop tabel lama (beserta policies) dan buat ulang
DROP TABLE IF EXISTS public.blogs CASCADE;

-- 1. Buat tabel blogs (v2 — tambah kolom author_avatar)
CREATE TABLE IF NOT EXISTS public.blogs (
  id              TEXT PRIMARY KEY,
  title           TEXT NOT NULL,
  excerpt         TEXT,
  content         TEXT,
  thumbnail       TEXT,
  category        TEXT NOT NULL,
  author_name     TEXT NOT NULL,
  author_email    TEXT,
  author_phone    TEXT,
  author_avatar   TEXT,                        -- opsional: URL foto profil penulis
  author_type     TEXT NOT NULL DEFAULT 'visitor' CHECK (author_type IN ('developer', 'visitor')),
  published_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reading_time    INTEGER DEFAULT 1,
  tags            TEXT[] DEFAULT '{}'
);

-- 2. Enable RLS (Row Level Security)
ALTER TABLE public.blogs ENABLE ROW LEVEL SECURITY;

-- 3. Policy: Semua orang bisa membaca blog
DROP POLICY IF EXISTS "blogs_select_public" ON public.blogs;
CREATE POLICY "blogs_select_public"
  ON public.blogs FOR SELECT
  USING (true);

-- 4. Policy: Semua orang bisa insert blog (visitor submissions)
DROP POLICY IF EXISTS "blogs_insert_public" ON public.blogs;
CREATE POLICY "blogs_insert_public"
  ON public.blogs FOR INSERT
  WITH CHECK (true);

-- 4b. Policy: Semua orang bisa update blog
DROP POLICY IF EXISTS "blogs_update_public" ON public.blogs;
CREATE POLICY "blogs_update_public"
  ON public.blogs FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- 4c. Policy: Semua orang bisa delete blog
DROP POLICY IF EXISTS "blogs_delete_public" ON public.blogs;
CREATE POLICY "blogs_delete_public"
  ON public.blogs FOR DELETE
  USING (true);

-- ============================================================
-- SUPABASE STORAGE: Bucket untuk thumbnail gambar artikel
-- ============================================================

-- 5. Buat storage bucket untuk thumbnail
INSERT INTO storage.buckets (id, name, public)
VALUES ('blog-thumbnails', 'blog-thumbnails', true)
ON CONFLICT (id) DO NOTHING;

-- 6. Policy: Semua orang bisa upload ke bucket blog-thumbnails
DROP POLICY IF EXISTS "blog_thumbnails_insert" ON storage.objects;
CREATE POLICY "blog_thumbnails_insert"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'blog-thumbnails');

-- 7. Policy: Semua orang bisa baca/akses gambar dari bucket blog-thumbnails
DROP POLICY IF EXISTS "blog_thumbnails_select" ON storage.objects;
CREATE POLICY "blog_thumbnails_select"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'blog-thumbnails');

-- 7b. Policy: Semua orang bisa update file di bucket blog-thumbnails
DROP POLICY IF EXISTS "blog_thumbnails_update" ON storage.objects;
CREATE POLICY "blog_thumbnails_update"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'blog-thumbnails')
  WITH CHECK (bucket_id = 'blog-thumbnails');

-- 7c. Policy: Semua orang bisa delete file di bucket blog-thumbnails
DROP POLICY IF EXISTS "blog_thumbnails_delete" ON storage.objects;
CREATE POLICY "blog_thumbnails_delete"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'blog-thumbnails');

-- ============================================================
-- SUPABASE STORAGE: Bucket untuk foto profil penulis (avatar)
-- ============================================================

-- 8. Buat storage bucket untuk author avatars
INSERT INTO storage.buckets (id, name, public)
VALUES ('author-avatars', 'author-avatars', true)
ON CONFLICT (id) DO NOTHING;

-- 9. Policy: Semua orang bisa upload foto profil penulis
DROP POLICY IF EXISTS "author_avatars_insert" ON storage.objects;
CREATE POLICY "author_avatars_insert"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'author-avatars');

-- 10. Policy: Semua orang bisa akses/baca foto profil penulis
DROP POLICY IF EXISTS "author_avatars_select" ON storage.objects;
CREATE POLICY "author_avatars_select"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'author-avatars');

-- 10b. Policy: Semua orang bisa update foto profil penulis
DROP POLICY IF EXISTS "author_avatars_update" ON storage.objects;
CREATE POLICY "author_avatars_update"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'author-avatars')
  WITH CHECK (bucket_id = 'author-avatars');

-- 10c. Policy: Semua orang bisa delete foto profil penulis
DROP POLICY IF EXISTS "author_avatars_delete" ON storage.objects;
CREATE POLICY "author_avatars_delete"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'author-avatars');

-- ============================================================
-- SUPABASE STORAGE: Bucket untuk foto profil tamu (guestbook)
-- ============================================================

-- 11. Buat storage bucket untuk guestbook avatars
INSERT INTO storage.buckets (id, name, public)
VALUES ('guestbook-avatars', 'guestbook-avatars', true)
ON CONFLICT (id) DO NOTHING;

-- 12. Policy: Semua orang bisa upload foto ke bucket guestbook-avatars
DROP POLICY IF EXISTS "guestbook_avatars_insert" ON storage.objects;
CREATE POLICY "guestbook_avatars_insert"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'guestbook-avatars');

-- 13. Policy: Semua orang bisa baca/akses foto dari bucket guestbook-avatars
DROP POLICY IF EXISTS "guestbook_avatars_select" ON storage.objects;
CREATE POLICY "guestbook_avatars_select"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'guestbook-avatars');

-- ============================================================
-- USER MANAGEMENT & SEED: Public Users Table
-- ============================================================

-- 14. RESET: Drop tabel users jika ada (menghapus data profile public lama agar fresh)
DROP TABLE IF EXISTS public.users CASCADE;

-- 15. Buat tabel public.users
CREATE TABLE IF NOT EXISTS public.users (
  id              UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email           TEXT,
  full_name       TEXT,
  avatar_url      TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 16. Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 17. Policies untuk public.users
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.users FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

-- 18. Function & Trigger untuk handle new user signup
--     Otomatis insert ke public.users saat ada user baru mendaftar di auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, avatar_url)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  RETURN new;
END;
$$;

-- Drop trigger jika sudah ada untuk menghindari duplikasi saat migrasi ulang
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ============================================================
-- SEED: Auth Users (Membuat user login default)
-- ============================================================

-- Pastikan ekstensi pgcrypto aktif untuk hashing password
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Insert default user ke auth.users jika belum ada
INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password, 
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data, 
  created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', -- UUID statis
  'authenticated',
  'authenticated',
  'agung@dev.com',
  crypt('password123', gen_salt('bf')), -- Password default: password123
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"Agung Kurniawan","avatar_url":"https://github.com/agungkurniawanid.png"}',
  NOW(), NOW(), '', '', '', ''
) ON CONFLICT (id) DO NOTHING;

-- 19. SEED: Backfill/Sync existing users
--     Mengisi ulang tabel public.users dari data auth.users yang sudah ada
INSERT INTO public.users (id, email, full_name, avatar_url)
SELECT id, email, raw_user_meta_data->>'full_name', raw_user_meta_data->>'avatar_url'
FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- SEED: Developer blogs awal (opsional — hapus jika tidak perlu)
-- ============================================================

INSERT INTO public.blogs (id, title, excerpt, content, thumbnail, category, author_name, author_email, author_avatar, author_type, published_at, reading_time, tags)
VALUES
  (
    'blog-001',
    'Membangun Sistem IoT Cerdas untuk Monitoring Kualitas Udara di Greenhouse',
    'Bagaimana saya menggabungkan sensor MQ-135, ESP32, FastAPI, dan model Deep Learning CNN untuk memantau dan mengontrol kualitas udara secara real-time di greenhouse pembibitan kopi.',
    '<h2>Latar Belakang Proyek</h2><p>Greenhouse pembibitan kopi membutuhkan kondisi udara yang optimal — kadar CO₂, kelembaban, dan suhu harus dijaga ketat. Saya membangun sistem IoT yang tidak hanya memantau, tetapi juga <strong>secara otomatis mengontrol</strong> kondisi tersebut menggunakan kecerdasan buatan.</p><h2>Arsitektur Sistem</h2><ul><li><strong>Edge Layer:</strong> Mikrokontroler ESP32 + sensor MQ-135, DHT22, dan kamera OV2640</li><li><strong>Backend Layer:</strong> FastAPI sebagai API server, mengelola data sensor dan trigger aktuator</li><li><strong>Intelligence Layer:</strong> Model CNN TensorFlow untuk klasifikasi penyakit daun kopi dari gambar</li></ul><blockquote><p>"IoT bukan sekadar menghubungkan perangkat — ini tentang membuat lingkungan fisik menjadi cerdas dan responsif."</p></blockquote>',
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
    'Tutorial',
    'Agung Kurniawan',
    'agung@dev.com',
    NULL,
    'developer',
    '2025-11-20T08:00:00.000Z',
    9,
    ARRAY['IoT', 'ESP32', 'Deep Learning', 'FastAPI', 'TensorFlow']
  ),
  (
    'blog-002',
    'Implementasi CNN untuk Klasifikasi Ekspresi Wajah dengan Flutter',
    'Perjalanan membangun model Deep Learning CNN dari nol hingga deployment di Flutter — mulai dari preprocessing dataset FER2013 hingga optimasi model untuk mobile inference.',
    '<h2>Mengapa Klasifikasi Ekspresi Wajah?</h2><p>Ekspresi wajah adalah salah satu kanal komunikasi manusia yang paling kaya informasi. Membangun sistem yang bisa mengenali emosi secara otomatis membuka peluang aplikasi di bidang <strong>kesehatan mental</strong>, <strong>UX research</strong>, hingga <strong>keamanan</strong>.</p><blockquote><p>"Model yang akurat di Jupyter Notebook tidak berguna jika tidak bisa berjalan di perangkat pengguna."</p></blockquote>',
    'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=800&q=80',
    'Technology',
    'Agung Kurniawan',
    'agung@dev.com',
    NULL,
    'developer',
    '2026-01-08T09:00:00.000Z',
    10,
    ARRAY['Deep Learning', 'CNN', 'TensorFlow', 'Flutter', 'Computer Vision']
  ),
  (
    'blog-003',
    'FastAPI + PostgreSQL: Membangun REST API Scalable untuk Aplikasi IoT',
    'Panduan lengkap membangun backend API yang mampu menangani ribuan request data sensor per menit menggunakan FastAPI, async SQLAlchemy, dan PostgreSQL dengan connection pooling.',
    '<h2>Kenapa FastAPI untuk IoT Backend?</h2><p>Ketika membangun backend untuk sistem IoT, ada dua tantangan utama: <strong>throughput tinggi</strong> dan <strong>latensi rendah</strong>. FastAPI dengan async/await adalah jawaban yang tepat.</p><blockquote><p>"API yang baik bukan hanya yang bisa diakses — tapi yang bisa bertahan di bawah beban tinggi."</p></blockquote>',
    'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&q=80',
    'Tutorial',
    'Agung Kurniawan',
    'agung@dev.com',
    NULL,
    'developer',
    '2026-02-03T10:00:00.000Z',
    12,
    ARRAY['FastAPI', 'PostgreSQL', 'Python', 'IoT', 'Backend']
  )
ON CONFLICT (id) DO NOTHING;
