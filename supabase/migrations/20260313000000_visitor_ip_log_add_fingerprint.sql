-- ============================================================
-- MIGRATION: visitor_ip_log — tambah browser_fingerprint sebagai
--            primary unique identifier (menggantikan ip_address)
-- Tanggal: 2026-03-13
-- Jalankan: node scripts/migrate-visitor-ip-log-fingerprint.mjs
-- Aman dijalankan berulang (idempotent)
--
-- Masalah sebelumnya:
--   Unique key hanya (ip_address, action_type) → pengguna berbeda
--   yang berbagi IP yang sama (WiFi kantor/kampus, CGNAT ISP, dll)
--   ikut terblokir padahal belum pernah melakukan aksi.
--
-- Solusi:
--   Tambah kolom browser_fingerprint (SHA-256 dari karakteristik browser).
--   Unique key baru: (browser_fingerprint, action_type).
--   ip_address tetap disimpan sebagai metadata/konteks, bukan penentu.
-- ============================================================

-- 1. Tambah kolom browser_fingerprint (nullable untuk baris lama)
ALTER TABLE public.visitor_ip_log
  ADD COLUMN IF NOT EXISTS browser_fingerprint TEXT NULL;

COMMENT ON COLUMN public.visitor_ip_log.browser_fingerprint
  IS 'SHA-256 browser fingerprint — identifikasi unik per perangkat/browser. Primary unique key.';

-- 2. Hapus unique index lama (ip_address, action_type)
DROP INDEX IF EXISTS public.visitor_ip_log_ip_action_idx;

-- 3. Buat unique index baru (browser_fingerprint, action_type)
--    WHERE fingerprint IS NOT NULL — baris legacy tanpa fingerprint tidak terpengaruh
CREATE UNIQUE INDEX IF NOT EXISTS visitor_ip_log_fp_action_idx
  ON public.visitor_ip_log (browser_fingerprint, action_type)
  WHERE browser_fingerprint IS NOT NULL;

-- 4. Pertahankan index ip_address sebagai index biasa (non-unique) untuk lookup
CREATE INDEX IF NOT EXISTS visitor_ip_log_ip_address_idx
  ON public.visitor_ip_log (ip_address);
