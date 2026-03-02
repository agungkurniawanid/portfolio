-- ============================================================
-- MIGRATION: Coding Journey Table — Schema + Seed Data
-- Date: 2026-03-07
-- Run in: Supabase Dashboard > SQL Editor
-- Idempotent (safe to re-run)
--
-- PURPOSE:
--   Stores every milestone in the "Perjalanan Belajar Coding"
--   (Coding Learning Journey) timeline on the About page.
--   Replacing the static TIMELINE_STATIC array with dynamic
--   data fetched from Supabase.
--
-- COLUMNS:
--   id             — UUID primary key
--   year           — year label for the milestone (e.g. "2022")
--   title          — short title of the milestone
--   description    — longer description shown in the card
--   icon_key       — React icon identifier resolved on the frontend
--                    Supports lucide keys (e.g. "GraduationCap", "Rocket")
--                    and react-icons/si keys (e.g. "SiCplusplus")
--   color          — Tailwind gradient class (e.g. "from-blue-500 to-cyan-500")
--   display_order  — UNIQUE integer controlling sort order (ASC)
--   is_published   — false = hide without deleting
--   created_at / updated_at — audit timestamps
-- ============================================================

-- ──────────────────────────────────────────────────
-- 0. Enable extensions (idempotent)
-- ──────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ──────────────────────────────────────────────────
-- 1. TABLE: coding_journey
-- ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.coding_journey (
  id             UUID        DEFAULT uuid_generate_v4() PRIMARY KEY,
  year           TEXT        NOT NULL,
  title          TEXT        NOT NULL,
  description    TEXT        NOT NULL DEFAULT '',
  icon_key       TEXT        NOT NULL DEFAULT 'Code2',
  color          TEXT        NOT NULL DEFAULT 'from-blue-500 to-cyan-500',
  display_order  SMALLINT    NOT NULL UNIQUE DEFAULT 0,
  is_published   BOOLEAN     NOT NULL DEFAULT true,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add UNIQUE constraint on display_order idempotently (for tables created before this migration)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'coding_journey_display_order_key'
       OR conname = 'uq_coding_journey_display_order'
       AND conrelid = 'public.coding_journey'::regclass
  ) THEN
    ALTER TABLE public.coding_journey ADD UNIQUE (display_order);
  END IF;
END;
$$;

-- ──────────────────────────────────────────────────
-- 2. updated_at trigger (same pattern as `skills`)
-- ──────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$;

DROP TRIGGER IF EXISTS trg_coding_journey_updated_at ON public.coding_journey;
CREATE TRIGGER trg_coding_journey_updated_at
  BEFORE UPDATE ON public.coding_journey
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

-- ──────────────────────────────────────────────────
-- 3. Indexes
-- ──────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_coding_journey_published
  ON public.coding_journey (is_published);

CREATE INDEX IF NOT EXISTS idx_coding_journey_display_order
  ON public.coding_journey (display_order);

-- ──────────────────────────────────────────────────
-- 4. Row Level Security
-- ──────────────────────────────────────────────────
ALTER TABLE public.coding_journey ENABLE ROW LEVEL SECURITY;

-- Public read (only published rows)
DROP POLICY IF EXISTS "coding_journey_public_read" ON public.coding_journey;
CREATE POLICY "coding_journey_public_read"
  ON public.coding_journey FOR SELECT
  USING (is_published = true);

-- Service-role full access (admin migrations / dashboard)
DROP POLICY IF EXISTS "coding_journey_service_all" ON public.coding_journey;
CREATE POLICY "coding_journey_service_all"
  ON public.coding_journey FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ──────────────────────────────────────────────────
-- 5. Seed Data
--    Source: TIMELINE_STATIC in src/app/about/page.tsx
--            + messages/en.json journey_* keys
--    Only the most important milestones are included.
-- ──────────────────────────────────────────────────
INSERT INTO public.coding_journey
  (year, title, description, icon_key, color, display_order)
VALUES
  (
    '2022',
    'Graduated Vocational School & Started Coding',
    'Just graduated and started seriously learning programming from scratch. Began the journey with algorithms and basic logic.',
    'GraduationCap',
    'from-blue-500 to-cyan-500',
    1
  ),
  (
    '2022',
    'Learned C++ for the First Time',
    'The first technology learned was C++. Studied programming fundamentals: variables, loops, functions, and basic OOP.',
    'SiCplusplus',
    'from-cyan-500 to-teal-500',
    2
  ),
  (
    '2022',
    'First Project: Laundry POS Application',
    'Successfully built a cashier app for a laundry business as the first real project. First experience creating useful software.',
    'Code2',
    'from-teal-500 to-green-500',
    3
  ),
  (
    '2022',
    'Decoding Bootcamp',
    'Attended an intensive bootcamp at Decoding. Deepened modern web development knowledge and thoroughly learned the JavaScript ecosystem.',
    'Rocket',
    'from-green-500 to-emerald-500',
    4
  ),
  (
    '2023',
    'Internship at Soko Financial Jogja',
    'Interned as a Remote Full Stack Developer at Soko Financial, Yogyakarta. First professional experience at a fintech startup.',
    'Briefcase',
    'from-emerald-500 to-accentColor',
    5
  ),
  (
    '2024',
    '3rd Place National Web Design Competition',
    'Won 3rd Place in the National Web Design Competition organized by UKM Linux at Universitas Jember. A proud competitive achievement.',
    'Star',
    'from-yellow-500 to-orange-500',
    6
  ),
  (
    '2025',
    'MBKM TEFA – Web Developer',
    'Participated in the MBKM TEFA (Teaching Factory) program in the Information Technology Department as a Web Developer. Worked on real web-based projects in an academic-industry environment.',
    'Globe',
    'from-orange-500 to-red-500',
    7
  ),
  (
    '2026',
    'Internship at PT BISI International & Charoen Pokphand',
    'Interned at PT BISI International Tbk and Charoen Pokphand Group as a Mobile App Developer. Developed Flutter-based mobile applications to support enterprise operations.',
    'Briefcase',
    'from-red-500 to-pink-500',
    8
  )
ON CONFLICT (display_order) DO NOTHING;
