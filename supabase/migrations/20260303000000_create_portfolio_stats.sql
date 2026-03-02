-- ============================================================
-- MIGRATION: Portfolio Stats — Schema + Seed
-- Date: 2026-03-03
-- Run in: Supabase Dashboard > SQL Editor
-- Idempotent (safe to re-run)
--
-- PURPOSE:
--   Store admin-managed site-wide stats surfaced in the About
--   section of the portfolio home page.
--
--   Stats tracked here:
--     • years_experience      — years coding / professional experience
--     • total_contributions   — total GitHub contributions
--     • hidden_projects_count — private projects not accessible to public
--
--   Total Completed Projects displayed on the UI is:
--     hidden_projects_count  ← stored in this table (admin-managed)
--   + public_repos           ← GitHub API (fetched server-side via /api/github-stats)
-- ============================================================

-- ──────────────────────────────────────────────────
-- 1. TABLE: portfolio_stats (singleton — one row)
-- ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.portfolio_stats (
  id                    UUID         DEFAULT uuid_generate_v4() PRIMARY KEY,
  years_experience      SMALLINT     NOT NULL DEFAULT 0,   -- years of programming experience
  total_contributions   INTEGER      NOT NULL DEFAULT 0,   -- total GitHub contributions (commits, PRs, reviews, issues)
  hidden_projects_count INTEGER      NOT NULL DEFAULT 0,   -- private/hidden projects not accessible to the public
  created_at            TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  public.portfolio_stats                        IS 'Singleton row storing admin-managed portfolio stat counters.';
COMMENT ON COLUMN public.portfolio_stats.years_experience        IS 'Years of programming / professional experience shown on the About section.';
COMMENT ON COLUMN public.portfolio_stats.total_contributions     IS 'Total GitHub contributions (commits, PRs, reviews, issues) shown on the About section.';
COMMENT ON COLUMN public.portfolio_stats.hidden_projects_count   IS 'Count of private/hidden completed projects (is_published=false) not visible to the public. Combined with GitHub public repos on the frontend to compute Total Completed Projects.';

-- ──────────────────────────────────────────────────
-- 2. AUTO-UPDATE updated_at trigger
-- ──────────────────────────────────────────────────
DROP TRIGGER IF EXISTS update_portfolio_stats_updated_at ON public.portfolio_stats;
CREATE TRIGGER update_portfolio_stats_updated_at
  BEFORE UPDATE ON public.portfolio_stats
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ──────────────────────────────────────────────────
-- 3. ROW LEVEL SECURITY — read-only for public
-- ──────────────────────────────────────────────────
ALTER TABLE public.portfolio_stats ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "portfolio_stats_public_read" ON public.portfolio_stats;
CREATE POLICY "portfolio_stats_public_read"
  ON public.portfolio_stats FOR SELECT
  USING (true);

-- ──────────────────────────────────────────────────
-- 4. SEED: initial stat values
--
--   hidden_projects_count : adjust this manually whenever you add a private
--                           project that should count toward "Completed Projects"
--                           but is NOT published publicly.
-- ──────────────────────────────────────────────────
INSERT INTO public.portfolio_stats (years_experience, total_contributions, hidden_projects_count)
VALUES (5, 24, 25)
ON CONFLICT DO NOTHING;

-- ──────────────────────────────────────────────────
-- 5. FUNCTION: get_hidden_projects_count()  [BONUS UTILITY]
--
--   Auto-computes the count of is_published=false projects using
--   SECURITY DEFINER so the anon role can get the number without
--   seeing the actual hidden rows.
--
--   This function can be called to keep hidden_projects_count in sync:
--
--     UPDATE public.portfolio_stats
--     SET hidden_projects_count = public.get_hidden_projects_count();
--
--   The primary source read by the API is the column (not the function),
--   so you can choose to call this function after adding/removing hidden
--   projects instead of editing the column manually.
-- ──────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.get_hidden_projects_count()
RETURNS INTEGER
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT COUNT(*)::INTEGER
  FROM   public.projects
  WHERE  is_published = false;
$$;

-- Allow anon and authenticated roles to invoke the function
GRANT EXECUTE ON FUNCTION public.get_hidden_projects_count() TO anon, authenticated;

-- ──────────────────────────────────────────────────
-- Done. Verify with:
--   SELECT * FROM public.portfolio_stats;
--   SELECT public.get_hidden_projects_count();
-- ──────────────────────────────────────────────────
