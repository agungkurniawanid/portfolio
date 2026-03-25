-- ============================================================
-- MIGRATION: Fix Certificates Storage RLS
-- Date: 2026-03-25
--
-- PURPOSE:
--   The original migration for the 'certificates' storage bucket
--   only allowed the 'service_role' to upload files. This
--   prevented the admin dashboard (running in the browser
--   with an 'authenticated' user role) from uploading
--   certificate PDFs and thumbnails, causing a "violates
--   row-level security policy" error.
--
--   This script adds a new, more specific policy to grant
--   'authenticated' users INSERT, UPDATE, and DELETE
--   permissions on the 'certificates' storage bucket.
-- ============================================================

-- ──────────────────────────────────────────────────
-- 1. Grant Authenticated Users Full Control on 'certificates' bucket
-- ──────────────────────────────────────────────────
DROP POLICY IF EXISTS "Authenticated can manage certificate files" ON storage.objects;

CREATE POLICY "Authenticated can manage certificate files"
  ON storage.objects
  FOR ALL -- covers INSERT, UPDATE, DELETE
  TO authenticated
  USING (bucket_id = 'certificates')
  WITH CHECK (bucket_id = 'certificates');

-- NOTE:
-- The existing policies for 'service_role' and public read access
-- are kept in place. This new policy simply adds the necessary
-- permissions for the dashboard without removing existing ones.
--
-- Old policies (for reference, no action needed):
-- CREATE POLICY "certificates_storage_public_read" ON storage.objects FOR SELECT USING (bucket_id = 'certificates');
-- CREATE POLICY "certificates_storage_service_insert" ON storage.objects FOR INSERT TO service_role WITH CHECK (bucket_id = 'certificates');
-- CREATE POLICY "certificates_storage_service_update" ON storage.objects FOR UPDATE TO service_role USING (bucket_id = 'certificates');
-- CREATE POLICY "certificates_storage_service_delete" ON storage.objects FOR DELETE TO service_role USING (bucket_id = 'certificates');
-- ============================================================
-- END OF MIGRATION
-- ============================================================
