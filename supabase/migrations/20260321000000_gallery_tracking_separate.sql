-- ============================================================
-- MIGRATION: Gallery Tracking — Pisahkan dari gallery_guests
--            ke visitor_ip_log (sistem tracking terpusat)
-- Tanggal: 2026-03-21
-- Aman dijalankan berulang (idempotent)
--
-- Perubahan:
--   1. Tambah action_type 'gallery_guest_registered' ke visitor_ip_log
--      → tracking gallery bergabung dengan banner/guestbook/welcome_popup
--   2. Hapus kolom ip_address dari gallery_guests
--      → IP tracking dipindah ke visitor_ip_log
--   3. Backfill visitor_ip_log dari data gallery_guests yang sudah ada
-- ============================================================

-- ──────────────────────────────────────────────────────────────
-- 1. Tambah 'gallery_guest_registered' ke CHECK constraint
--    visitor_ip_log.action_type
-- ──────────────────────────────────────────────────────────────
DO $$
BEGIN
  -- Hapus constraint lama
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name      = 'visitor_ip_log'
      AND constraint_name = 'visitor_ip_log_action_type_check'
      AND constraint_type = 'CHECK'
  ) THEN
    ALTER TABLE public.visitor_ip_log
      DROP CONSTRAINT visitor_ip_log_action_type_check;
  END IF;

  -- Tambah constraint baru dengan 5 nilai (termasuk gallery_guest_registered)
  ALTER TABLE public.visitor_ip_log
    ADD CONSTRAINT visitor_ip_log_action_type_check
      CHECK (action_type IN (
        'welcome_popup_submitted',
        'welcome_popup_hidden',
        'banner_dismissed',
        'guestbook_submitted',
        'gallery_guest_registered'
      ));
END;
$$;

COMMENT ON COLUMN public.visitor_ip_log.action_type
  IS 'Tipe aksi: welcome_popup_submitted | welcome_popup_hidden | banner_dismissed | guestbook_submitted | gallery_guest_registered';

-- ──────────────────────────────────────────────────────────────
-- 2. Backfill visitor_ip_log dari gallery_guests yang sudah ada
--    Hanya untuk entries yang punya ip_address valid (non-null)
-- ──────────────────────────────────────────────────────────────
INSERT INTO public.visitor_ip_log (ip_address, action_type, browser_fingerprint, created_at)
SELECT
  ip_address,
  'gallery_guest_registered',
  browser_fingerprint,
  created_at
FROM public.gallery_guests
WHERE ip_address IS NOT NULL
  AND browser_fingerprint IS NOT NULL
ON CONFLICT DO NOTHING;

-- ──────────────────────────────────────────────────────────────
-- 3. Hapus kolom ip_address dari gallery_guests
--    IP tracking kini dikelola di visitor_ip_log
-- ──────────────────────────────────────────────────────────────
ALTER TABLE public.gallery_guests
  DROP COLUMN IF EXISTS ip_address;

-- ──────────────────────────────────────────────────────────────
-- Done!
-- Verifikasi:
--   SELECT action_type, COUNT(*) FROM public.visitor_ip_log GROUP BY action_type;
--   SELECT column_name FROM information_schema.columns
--     WHERE table_name = 'gallery_guests';
-- ──────────────────────────────────────────────────────────────
