-- ============================================================
-- MIGRATION: Skills Table — Schema + Seed Data
-- Date: 2026-03-05
-- Run in: Supabase Dashboard > SQL Editor
-- Idempotent (safe to re-run)
--
-- PURPOSE:
--   Stores every technical skill displayed on the Skills /
--   Tech-Stack pages.  The `count(*)` of this table drives the
--   "Total Teknologi Dikuasai" stat on the About page.
--
-- COLUMNS:
--   id             — UUID primary key
--   name           — human-readable skill name (e.g. "React")
--   category       — skill group: frontend | backend | ai_ml |
--                    mobile | devops | database | cloud
--   icon_key       — react-icons SI key (e.g. "SiReact").
--                    Used by the front-end to render the correct icon.
--   icon_color     — hex colour for the icon glow/tint
--   level          — proficiency 0–100 (shown as progress bar)
--   display_order  — optional manual sort within a category
--   is_published   — false = hide from public without deleting
--   created_at / updated_at — audit timestamps
-- ============================================================

-- ──────────────────────────────────────────────────
-- 0. Enable extensions (idempotent)
-- ──────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ──────────────────────────────────────────────────
-- 1. TABLE: skills
-- ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.skills (
  id             UUID        DEFAULT uuid_generate_v4() PRIMARY KEY,
  name           TEXT        NOT NULL,
  category       TEXT        NOT NULL
                 CHECK (category IN (
                   'frontend', 'backend', 'ai_ml',
                   'mobile',   'devops',  'database', 'cloud'
                 )),
  icon_key       TEXT        NOT NULL DEFAULT '',       -- e.g. "SiReact"
  icon_color     TEXT        NOT NULL DEFAULT '#ffffff', -- hex tint colour
  level          SMALLINT    NOT NULL DEFAULT 0
                 CHECK (level BETWEEN 0 AND 100),
  display_order  SMALLINT    NOT NULL DEFAULT 0,
  is_published   BOOLEAN     NOT NULL DEFAULT true,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ──────────────────────────────────────────────────
-- 2. updated_at trigger (same pattern as `projects`)
-- ──────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$;

DROP TRIGGER IF EXISTS trg_skills_updated_at ON public.skills;
CREATE TRIGGER trg_skills_updated_at
  BEFORE UPDATE ON public.skills
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

-- ──────────────────────────────────────────────────
-- 3. Indexes
-- ──────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_skills_category
  ON public.skills (category);

CREATE INDEX IF NOT EXISTS idx_skills_published
  ON public.skills (is_published);

-- ──────────────────────────────────────────────────
-- 4. Row Level Security
-- ──────────────────────────────────────────────────
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;

-- Public read (only published rows)
DROP POLICY IF EXISTS "skills_public_read" ON public.skills;
CREATE POLICY "skills_public_read"
  ON public.skills FOR SELECT
  USING (is_published = true);

-- Service-role full access (admin migrations / dashboard)
DROP POLICY IF EXISTS "skills_service_all" ON public.skills;
CREATE POLICY "skills_service_all"
  ON public.skills FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ──────────────────────────────────────────────────
-- 5. Seed Data
--    Source: src/app/skills/page.tsx  (useCategories hook)
--    Each skill appears once in its primary category.
-- ──────────────────────────────────────────────────

INSERT INTO public.skills (name, category, icon_key, icon_color, level, display_order)
VALUES
  -- ── Frontend (9) ──────────────────────────────
  ('React',         'frontend', 'SiReact',       '#61DAFB', 92,  1),
  ('Next.js',       'frontend', 'SiNextdotjs',   '#000000', 90,  2),
  ('TypeScript',    'frontend', 'SiTypescript',  '#3178C6', 85,  3),
  ('JavaScript',    'frontend', 'SiJavascript',  '#F7DF1E', 90,  4),
  ('TailwindCSS',   'frontend', 'SiTailwindcss', '#38BDF8', 93,  5),
  ('HTML5',         'frontend', 'SiHtml5',       '#E34F26', 95,  6),
  ('CSS3',          'frontend', 'SiCss3',        '#1572B6', 90,  7),
  ('Framer Motion', 'frontend', 'SiFramer',      '#F859A2', 76,  8),
  ('Redux',         'frontend', 'SiRedux',       '#764ABC', 78,  9),

  -- ── Backend (10) ──────────────────────────────
  ('Node.js',   'backend', 'SiNodedotjs', '#339933', 83,  1),
  ('Express',   'backend', 'SiExpress',   '#9E9E9E', 82,  2),
  ('NestJS',    'backend', 'SiNestjs',    '#E0234E', 75,  3),
  ('FastAPI',   'backend', 'SiFastapi',   '#009688', 82,  4),
  ('Flask',     'backend', 'SiFlask',     '#9E9E9E', 78,  5),
  ('Django',    'backend', 'SiDjango',    '#092E20', 74,  6),
  ('Golang',    'backend', 'SiGo',        '#00ADD8', 70,  7),
  ('Laravel',   'backend', 'SiLaravel',   '#FF2D20', 80,  8),
  ('Python',    'backend', 'SiPython',    '#F7D754', 88,  9),
  ('PHP',       'backend', 'SiPhp',       '#777BB4', 75, 10),

  -- ── AI / ML (7) ───────────────────────────────
  ('TensorFlow',   'ai_ml', 'SiTensorflow',  '#FF6F00', 80, 1),
  ('Keras',        'ai_ml', 'SiKeras',       '#D00000', 80, 2),
  ('PyTorch',      'ai_ml', 'SiPytorch',     '#EE4C2C', 72, 3),
  ('Scikit-Learn', 'ai_ml', 'SiScikitlearn', '#F7931E', 82, 4),
  ('OpenCV',       'ai_ml', 'SiOpencv',      '#5C3EE8', 75, 5),
  ('OpenAI API',   'ai_ml', 'SiOpenai',      '#74AA9C', 78, 6),
  ('Deep Learning','ai_ml', 'FaMicrochip',   '#818CF8', 74, 7),

  -- ── Mobile (1) ────────────────────────────────
  ('Flutter', 'mobile', 'SiFlutter', '#54C5F8', 78, 1),

  -- ── DevOps & Tools (5) ────────────────────────
  ('Docker', 'devops', 'SiDocker', '#2496ED', 78, 1),
  ('Git',    'devops', 'SiGit',    '#F05032', 90, 2),
  ('GitHub', 'devops', 'SiGithub', '#181717', 90, 3),
  ('Linux',  'devops', 'SiLinux',  '#FCC624', 76, 4),
  ('Vercel', 'devops', 'SiVercel', '#000000', 88, 5),

  -- ── Database (4) ──────────────────────────────
  ('MongoDB',    'database', 'SiMongodb',    '#47A248', 80, 1),
  ('MySQL',      'database', 'SiMysql',      '#4479A1', 82, 2),
  ('PostgreSQL', 'database', 'SiPostgresql', '#4169E1', 78, 3),
  ('Firebase',   'database', 'SiFirebase',   '#FFCA28', 80, 4),

  -- ── Cloud (2) ─────────────────────────────────
  ('AWS', 'cloud', 'SiAmazon',      '#FF9900', 68, 1),
  ('GCP', 'cloud', 'SiGooglecloud', '#4285F4', 70, 2)

ON CONFLICT DO NOTHING;
