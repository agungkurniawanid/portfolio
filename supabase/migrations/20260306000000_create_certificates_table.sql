-- ============================================================
-- MIGRATION: Certificates Table + Storage Bucket
-- Date: 2026-03-06
-- Run in: Supabase Dashboard > SQL Editor
-- Idempotent (safe to re-run)
--
-- PURPOSE:
--   1. Create the `certificates` table that stores every certificate
--      displayed on the Certificate page.  COUNT(*) of this table drives
--      the "Total Sertifikat" stat on the About page.
--   2. Create the `certificates` Storage bucket for PDF files with
--      appropriate RLS policies.
--
-- COLUMNS:
--   id              — UUID primary key
--   title           — certificate / award title
--   description     — short description
--   category        — one of the CertificateCategory values
--   issuer_name     — issuing organisation
--   issuer_logo_url — optional logo URL of the issuer
--   issue_date      — date certificate was issued (DATE)
--   expiry_date     — expiry date, NULL if Lifetime
--   status          — Valid | Expired | Lifetime
--   pdf_url         — path inside `certificates` Storage bucket
--                     (e.g. "certificates/2024/aws-cloud-practitioner.pdf")
--   thumbnail_url   — preview image URL (Storage or external)
--   display_order   — optional manual sort
--   is_published    — false = soft-deleted / hidden from public
--   created_at / updated_at — audit timestamps
-- ============================================================

-- ──────────────────────────────────────────────────
-- 0. Enable extensions (idempotent)
-- ──────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ──────────────────────────────────────────────────
-- 1. TABLE: certificates
-- ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.certificates (
  id              UUID        DEFAULT uuid_generate_v4() PRIMARY KEY,
  title           TEXT        NOT NULL,
  description     TEXT        NOT NULL DEFAULT '',
  category        TEXT        NOT NULL
                  CHECK (category IN (
                    'Magang / Internship',
                    'Bootcamp',
                    'Course Online',
                    'Webinar / Seminar',
                    'Sertifikasi Resmi',
                    'Kompetisi / Lomba'
                  )),
  issuer_name     TEXT        NOT NULL,
  issuer_logo_url TEXT,                               -- external or Storage URL
  issue_date      DATE        NOT NULL,
  expiry_date     DATE,                               -- NULL = Lifetime
  status          TEXT        NOT NULL DEFAULT 'Lifetime'
                  CHECK (status IN ('Valid', 'Expired', 'Lifetime')),
  pdf_url         TEXT,                               -- path in `certificates` Storage bucket
  thumbnail_url   TEXT,                               -- preview image URL
  display_order   SMALLINT    NOT NULL DEFAULT 0,
  is_published    BOOLEAN     NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ──────────────────────────────────────────────────
-- 2. updated_at trigger
-- ──────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$;

DROP TRIGGER IF EXISTS trg_certificates_updated_at ON public.certificates;
CREATE TRIGGER trg_certificates_updated_at
  BEFORE UPDATE ON public.certificates
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

-- ──────────────────────────────────────────────────
-- 3. Indexes
-- ──────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_certificates_category
  ON public.certificates (category);

CREATE INDEX IF NOT EXISTS idx_certificates_status
  ON public.certificates (status);

CREATE INDEX IF NOT EXISTS idx_certificates_published
  ON public.certificates (is_published);

CREATE INDEX IF NOT EXISTS idx_certificates_issue_date
  ON public.certificates (issue_date DESC);

-- ──────────────────────────────────────────────────
-- 4. Row Level Security — table
-- ──────────────────────────────────────────────────
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

-- Public read (only published rows)
DROP POLICY IF EXISTS "certificates_public_read" ON public.certificates;
CREATE POLICY "certificates_public_read"
  ON public.certificates FOR SELECT
  USING (is_published = true);

-- Service-role full access (admin migrations / dashboard)
DROP POLICY IF EXISTS "certificates_service_all" ON public.certificates;
CREATE POLICY "certificates_service_all"
  ON public.certificates FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ──────────────────────────────────────────────────
-- 5. Storage Bucket: certificates
--    • Public bucket — PDFs and thumbnail images are publicly readable.
--    • PDF files go in:   certificates/pdf/<filename>.pdf
--    • Thumbnail images:  certificates/thumbnails/<filename>.jpg
--    • File size limit:   20 MB (covers high-quality PDF scans)
--    • Allowed MIME types: PDF + common image formats
-- ──────────────────────────────────────────────────
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'certificates',
  'certificates',
  true,
  20971520, -- 20 MB
  ARRAY[
    'application/pdf',
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- ── Storage RLS policies ──────────────────────────
-- Public read: anyone can download files from this bucket
DROP POLICY IF EXISTS "certificates_storage_public_read" ON storage.objects;
CREATE POLICY "certificates_storage_public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'certificates');

-- Service-role write (upload / replace from admin tools / scripts)
DROP POLICY IF EXISTS "certificates_storage_service_insert" ON storage.objects;
CREATE POLICY "certificates_storage_service_insert"
  ON storage.objects FOR INSERT
  TO service_role
  WITH CHECK (bucket_id = 'certificates');

DROP POLICY IF EXISTS "certificates_storage_service_update" ON storage.objects;
CREATE POLICY "certificates_storage_service_update"
  ON storage.objects FOR UPDATE
  TO service_role
  USING (bucket_id = 'certificates');

DROP POLICY IF EXISTS "certificates_storage_service_delete" ON storage.objects;
CREATE POLICY "certificates_storage_service_delete"
  ON storage.objects FOR DELETE
  TO service_role
  USING (bucket_id = 'certificates');

-- ──────────────────────────────────────────────────
-- 6. Seed Data
-- NOTE: No seed data — table is intentionally left empty.
--       Real data is entered via admin tools / dashboard.
--       (Seed rows were removed in 20260315000000_update_certificates_clear_seed.sql)
-- ──────────────────────────────────────────────────
-- (no inserts — table left empty intentionally)
