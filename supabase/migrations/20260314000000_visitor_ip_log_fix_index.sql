-- ============================================================
-- MIGRATION: visitor_ip_log — fix partial index ke regular unique index
-- Tanggal: 2026-03-14
-- Jalankan: node scripts/migrate-visitor-ip-log-fix-index.mjs
-- Aman dijalankan berulang (idempotent)
--
-- Root cause:
--   Partial index (WHERE browser_fingerprint IS NOT NULL) tidak kompatibel
--   dengan ON CONFLICT (columns) di PostgreSQL. Supabase upsert gagal
--   karena tidak bisa menemukan constraint yang cocok.
--
-- Fix:
--   Ganti ke regular unique index (non-partial).
--   PostgreSQL menganggap NULL sebagai nilai DISTINCT dalam unique index,
--   sehingga multiple NULL rows tidak akan saling konflik — aman.
-- ============================================================

-- 1. Hapus partial index lama
DROP INDEX IF EXISTS public.visitor_ip_log_fp_action_idx;

-- 2. Buat regular unique index (non-partial)
CREATE UNIQUE INDEX IF NOT EXISTS visitor_ip_log_fp_action_idx
  ON public.visitor_ip_log (browser_fingerprint, action_type);
