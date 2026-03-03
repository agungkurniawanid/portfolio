-- ============================================================
-- MIGRATION: guestbook — fix RLS INSERT policy
-- Tanggal: 2026-03-14
-- Jalankan: node scripts/migrate-guestbook-fix-rls.mjs
-- Aman dijalankan berulang (idempotent)
--
-- Root cause:
--   Policy "Anyone can insert guestbook entry" menggunakan subquery
--   ke tabel guestbook itu sendiri di dalam WITH CHECK. Saat anon user
--   mencoba INSERT, PostgreSQL menjalankan subquery tersebut — yang juga
--   dikenai RLS. Ini menyebabkan recursive policy evaluation yang
--   menghasilkan error "new row violates row-level security policy".
--
-- Fix:
--   Ganti WITH CHECK ke (true) — izinkan semua insert dari anon.
--   Proteksi duplikat sudah ditangani oleh:
--     1. UNIQUE constraint pada kolom browser_fingerprint (DB level)
--     2. App-level check sebelum insert (GuestbookFormModal.tsx)
-- ============================================================

-- Drop policy lama yang bermasalah
DROP POLICY IF EXISTS "Anyone can insert guestbook entry" ON public.guestbook;

-- Buat policy baru yang sederhana
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename  = 'guestbook'
      AND policyname = 'Anyone can insert guestbook entry'
  ) THEN
    EXECUTE $p$
      CREATE POLICY "Anyone can insert guestbook entry"
        ON public.guestbook FOR INSERT
        TO anon, authenticated
        WITH CHECK (true)
    $p$;
  END IF;
END;
$$;
