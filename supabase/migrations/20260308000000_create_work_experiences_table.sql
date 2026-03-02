-- ============================================================
-- MIGRATION: Work Experiences Table — Schema + Seed Data
-- Date: 2026-03-08
-- Run in: Supabase Dashboard > SQL Editor
-- Idempotent (safe to re-run)
--
-- PURPOSE:
--   Stores every professional / internship / part-time experience
--   displayed in the "Pengalaman Kerja & Magang" section on the About
--   page. Replaces the static `experiences` array in about/page.tsx.
--
-- COLUMNS:
--   id              — UUID primary key
--   company         — company / organisation name
--   position        — job title / role name
--   employment_type — Full-time | Part-time | Internship | Contract | Freelance
--   start_date      — first day of employment (stored as DATE)
--   end_date        — last day of employment (NULL = still active / "Present")
--   is_current      — explicit "Present" flag (true when still working there)
--   location        — city + region (e.g. "Kediri, East Java, Indonesia")
--   work_mode       — On-site | Remote | Hybrid
--   description     — longer role description shown in the card
--   tech_stack      — array of technology / tool names (text[])
--   display_order   — UNIQUE integer controlling card sort order (ASC)
--   is_published    — false = hide without deleting
--   created_at / updated_at — audit timestamps
-- ============================================================

-- ──────────────────────────────────────────────────
-- 0. Enable extensions (idempotent)
-- ──────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ──────────────────────────────────────────────────
-- 1. TABLE: work_experiences
-- ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.work_experiences (
  id              UUID        DEFAULT uuid_generate_v4() PRIMARY KEY,
  company         TEXT        NOT NULL,
  position        TEXT        NOT NULL,
  employment_type TEXT        NOT NULL DEFAULT 'Full-time'
                  CHECK (employment_type IN (
                    'Full-time', 'Part-time', 'Internship', 'Contract', 'Freelance'
                  )),
  start_date      DATE        NOT NULL,
  end_date        DATE        NULL,                       -- NULL means still active
  is_current      BOOLEAN     NOT NULL DEFAULT false,
  location        TEXT        NOT NULL DEFAULT '',
  work_mode       TEXT        NOT NULL DEFAULT ''
                  CHECK (work_mode IN ('On-site', 'Remote', 'Hybrid', '')),
  description     TEXT        NOT NULL DEFAULT '',
  tech_stack      TEXT[]      NOT NULL DEFAULT '{}',
  display_order   SMALLINT    NOT NULL UNIQUE DEFAULT 0,
  is_published    BOOLEAN     NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ──────────────────────────────────────────────────
-- 2. updated_at trigger (same pattern as `coding_journey`)
-- ──────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$;

DROP TRIGGER IF EXISTS trg_work_experiences_updated_at ON public.work_experiences;
CREATE TRIGGER trg_work_experiences_updated_at
  BEFORE UPDATE ON public.work_experiences
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

-- ──────────────────────────────────────────────────
-- 3. Indexes
-- ──────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_work_exp_published
  ON public.work_experiences (is_published);

CREATE INDEX IF NOT EXISTS idx_work_exp_display_order
  ON public.work_experiences (display_order);

CREATE INDEX IF NOT EXISTS idx_work_exp_start_date
  ON public.work_experiences (start_date DESC);

-- ──────────────────────────────────────────────────
-- 4. Row Level Security
-- ──────────────────────────────────────────────────
ALTER TABLE public.work_experiences ENABLE ROW LEVEL SECURITY;

-- Public read (only published rows)
DROP POLICY IF EXISTS "work_experiences_public_read" ON public.work_experiences;
CREATE POLICY "work_experiences_public_read"
  ON public.work_experiences FOR SELECT
  USING (is_published = true);

-- Service-role full access (admin migrations / dashboard)
DROP POLICY IF EXISTS "work_experiences_service_all" ON public.work_experiences;
CREATE POLICY "work_experiences_service_all"
  ON public.work_experiences FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ──────────────────────────────────────────────────
-- 5. Seed Data
--    Source: EXPERIENCES_STATIC in src/app/about/page.tsx
--    start_date / end_date use the 1st of the given month.
--    display_order preserves the original card order.
-- ──────────────────────────────────────────────────
INSERT INTO public.work_experiences
  (company, position, employment_type,
   start_date, end_date, is_current,
   location, work_mode,
   description, tech_stack, display_order)
VALUES
  -- 1. Charoen Pokphand Indonesia
  (
    'Charoen Pokphand Indonesia',
    'Information Communication Technology',
    'Internship',
    '2025-10-01', NULL, true,
    'Kediri, East Java, Indonesia', 'On-site',
    'As an ICT Intern specialized in Mobile Development at Charoen Pokphand Indonesia, I am actively involved in the design, development, and maintenance of mobile applications that support the company''s operational efficiency. I collaborate closely with the software engineering team to build user-friendly interfaces, write clean and maintainable code, and ensure seamless application performance across different devices.',
    ARRAY['Flutter', 'Firebase'],
    1
  ),
  -- 2. PT. BISI International
  (
    'PT. BISI International, Tbk',
    'Mobile Developer',
    'Internship',
    '2025-10-01', NULL, true,
    'Kediri, East Java, Indonesia', 'On-site',
    'As a Mobile Developer Intern at PT. BISI International, Tbk in Kediri, I contribute to the development of mobile applications designed to streamline agricultural operations and enhance business efficiency. I work closely with the engineering team to build scalable features, optimize application performance, and ensure a seamless user experience for field staff and internal users.',
    ARRAY['Flutter', 'Firebase'],
    2
  ),
  -- 3. CV Dharma Adi Putra — Network Technician
  (
    'CV Dharma Adi Putra',
    'Network Technician',
    'Part-time',
    '2020-04-01', NULL, true,
    'Kabupaten Banyuwangi, East Java, Indonesia', 'Hybrid',
    'As a Network Technician at CV Dharma Adi Putra, I am responsible for the comprehensive maintenance of server and network infrastructure across both office and field environments. I oversee the installation of new network systems tailored to client needs while expertly troubleshooting connectivity issues to ensure stable service. Working within a hybrid system, I manage both on-site operations and remote monitoring.',
    ARRAY['Network Installation', 'Network Troubleshooting', 'Network Services'],
    3
  ),
  -- 4. CV Dharma Adi Putra — Full Stack Developer
  (
    'CV Dharma Adi Putra',
    'Full Stack Developer',
    'Part-time',
    '2020-04-01', '2025-10-31', false,
    'Banyuwangi, East Java, Indonesia', 'Remote',
    'As a Full Stack Developer at CV Dharma Adi Putra, I engineer web and mobile applications that are seamlessly integrated with Mikrotik network infrastructure. I focus on developing specialized solutions for financial management, including automated transaction processing and billing systems.',
    ARRAY['Flutter', 'Next.js', 'PostgreSQL'],
    4
  ),
  -- 5. JTI Innovation Center
  (
    'JTI Innovation Center',
    'Web Developer',
    'Contract',
    '2025-02-01', '2025-07-31', false,
    'Jember, East Java, Indonesia', 'On-site',
    'As a Web Developer at JTI Innovation Center, I play a key role in developing web-based applications that strictly adhere to client requirements and functional standards. I ensure comprehensive feature implementation across both frontend and backend layers. Leveraging the Laravel framework, I construct efficient, structured, and scalable systems.',
    ARRAY['Laravel', 'Next.js'],
    5
  ),
  -- 6. SOKO FINANCIAL
  (
    'SOKO FINANCIAL',
    'Full Stack Developer',
    'Internship',
    '2024-06-01', '2024-09-30', false,
    'Yogyakarta, Indonesia', 'Remote',
    'As a Full Stack Developer Intern at SOKO FINANCIAL, I contributed to the end-to-end development of the company''s financial web platform. I was responsible for translating high-fidelity designs from the UI team into functional frontend code while managing complex backend logic on the client side.',
    ARRAY['Laravel', 'Tailwind CSS', 'JavaScript'],
    6
  )
ON CONFLICT (display_order) DO NOTHING;
