-- ============================================================
-- MIGRATION: visitor_ip_log — tambah action_type 'guestbook_submitted'
-- Tanggal: 2026-03-12
-- Jalankan: node scripts/migrate-visitor-ip-log-guestbook.mjs
-- Aman dijalankan berulang (idempotent)
--
-- Mengubah CHECK constraint visitor_ip_log_action_type_check
-- menjadi mencakup nilai 'guestbook_submitted' sehingga
-- bisa merekam IP tamu yang sudah mengisi Buku Tamu.
-- ============================================================

-- Drop constraint lama, ganti dengan yang baru (idempotent via DO block)
DO $$
BEGIN
  -- Hapus constraint lama jika ada
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name       = 'visitor_ip_log'
      AND constraint_name  = 'visitor_ip_log_action_type_check'
      AND constraint_type  = 'CHECK'
  ) THEN
    ALTER TABLE public.visitor_ip_log
      DROP CONSTRAINT visitor_ip_log_action_type_check;
  END IF;

  -- Tambah constraint baru dengan 4 nilai
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name      = 'visitor_ip_log'
      AND constraint_name = 'visitor_ip_log_action_type_check'
      AND constraint_type = 'CHECK'
  ) THEN
    ALTER TABLE public.visitor_ip_log
      ADD CONSTRAINT visitor_ip_log_action_type_check
        CHECK (action_type IN (
          'welcome_popup_submitted',
          'welcome_popup_hidden',
          'banner_dismissed',
          'guestbook_submitted'
        ));
  END IF;
END;
$$;
