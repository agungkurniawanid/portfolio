-- ============================================================
-- SUPABASE MIGRATION: Blog System
-- Jalankan SQL ini di Supabase Dashboard > SQL Editor
-- ============================================================

-- 1. Buat tabel blogs
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
  author_type     TEXT NOT NULL DEFAULT 'visitor' CHECK (author_type IN ('developer', 'visitor')),
  published_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reading_time    INTEGER DEFAULT 1,
  tags            TEXT[] DEFAULT '{}'
);

-- 2. Enable RLS (Row Level Security)
ALTER TABLE public.blogs ENABLE ROW LEVEL SECURITY;

-- 3. Policy: Semua orang bisa membaca blog
CREATE POLICY "blogs_select_public"
  ON public.blogs FOR SELECT
  USING (true);

-- 4. Policy: Semua orang bisa insert blog (visitor submissions)
CREATE POLICY "blogs_insert_public"
  ON public.blogs FOR INSERT
  WITH CHECK (true);

-- ============================================================
-- SUPABASE STORAGE: Bucket untuk thumbnail gambar
-- ============================================================

-- 5. Buat storage bucket untuk thumbnail
INSERT INTO storage.buckets (id, name, public)
VALUES ('blog-thumbnails', 'blog-thumbnails', true)
ON CONFLICT (id) DO NOTHING;

-- 6. Policy: Semua orang bisa upload ke bucket blog-thumbnails
CREATE POLICY "blog_thumbnails_insert"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'blog-thumbnails');

-- 7. Policy: Semua orang bisa baca/akses gambar dari bucket
CREATE POLICY "blog_thumbnails_select"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'blog-thumbnails');

-- ============================================================
-- SEED: Developer blogs awal (opsional — hapus jika tidak perlu)
-- ============================================================

INSERT INTO public.blogs (id, title, excerpt, content, thumbnail, category, author_name, author_email, author_type, published_at, reading_time, tags)
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
    'developer',
    '2026-02-03T10:00:00.000Z',
    12,
    ARRAY['FastAPI', 'PostgreSQL', 'Python', 'IoT', 'Backend']
  )
ON CONFLICT (id) DO NOTHING;
