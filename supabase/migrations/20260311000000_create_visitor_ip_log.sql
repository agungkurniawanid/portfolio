-- ============================================================
-- MIGRATION: Visitor IP Log
-- Tanggal: 2026-03-11
-- Jalankan: node scripts/migrate-visitor-ip-log.mjs
-- Aman dijalankan berulang (idempotent)
--
-- Menambahkan:
--   • visitor_ip_log — log IP pengunjung untuk mencegah
--     spam/duplikasi pada WelcomePopup dan GuestbookBanner
--     meskipun user menghapus localStorage/sessionStorage.
-- ============================================================

-- ──────────────────────────────────────────────────────────────
-- 1. TABLE: visitor_ip_log
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.visitor_ip_log (
  id           BIGSERIAL    PRIMARY KEY,
  ip_address   TEXT         NOT NULL,
  action_type  TEXT         NOT NULL,
  created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

  CONSTRAINT visitor_ip_log_action_type_check
    CHECK (action_type IN (
      'welcome_popup_submitted',
      'welcome_popup_hidden',
      'banner_dismissed'
    ))
);

COMMENT ON TABLE  public.visitor_ip_log               IS 'Log IP pengunjung untuk pengecekan anti-spam pada WelcomePopup dan GuestbookBanner.';
COMMENT ON COLUMN public.visitor_ip_log.ip_address    IS 'Alamat IP pengunjung (IPv4/IPv6). Diambil dari header x-forwarded-for atau x-real-ip.';
COMMENT ON COLUMN public.visitor_ip_log.action_type   IS 'Tipe aksi: welcome_popup_submitted | welcome_popup_hidden | banner_dismissed.';

-- ──────────────────────────────────────────────────────────────
-- 2. Unique index: satu catatan per IP per action_type
-- ──────────────────────────────────────────────────────────────
CREATE UNIQUE INDEX IF NOT EXISTS visitor_ip_log_ip_action_idx
  ON public.visitor_ip_log (ip_address, action_type);

-- ──────────────────────────────────────────────────────────────
-- 3. Index bantu untuk query per IP
-- ──────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS visitor_ip_log_ip_address_idx
  ON public.visitor_ip_log (ip_address);

-- ──────────────────────────────────────────────────────────────
-- 4. Row Level Security
-- ──────────────────────────────────────────────────────────────
ALTER TABLE public.visitor_ip_log ENABLE ROW LEVEL SECURITY;

-- Service role (digunakan oleh Next.js API route) punya akses penuh
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'visitor_ip_log'
      AND policyname = 'Service role full access on visitor_ip_log'
  ) THEN
    EXECUTE $p$
      CREATE POLICY "Service role full access on visitor_ip_log"
        ON public.visitor_ip_log FOR ALL
        TO service_role
        USING (true)
        WITH CHECK (true)
    $p$;
  END IF;
END;
$$;

-- Anon boleh SELECT (fallback jika service role key tidak tersedia)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'visitor_ip_log'
      AND policyname = 'Anon can read visitor_ip_log'
  ) THEN
    EXECUTE $p$
      CREATE POLICY "Anon can read visitor_ip_log"
        ON public.visitor_ip_log FOR SELECT
        TO anon
        USING (true)
    $p$;
  END IF;
END;
$$;

-- Anon boleh INSERT (fallback jika service role key tidak tersedia)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'visitor_ip_log'
      AND policyname = 'Anon can insert visitor_ip_log'
  ) THEN
    EXECUTE $p$
      CREATE POLICY "Anon can insert visitor_ip_log"
        ON public.visitor_ip_log FOR INSERT
        TO anon
        WITH CHECK (true)
    $p$;
  END IF;
END;
$$;
