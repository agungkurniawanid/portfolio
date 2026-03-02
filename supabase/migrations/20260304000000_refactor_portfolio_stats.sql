-- ──────────────────────────────────────────────────────────────────────────────
-- Migration: 20260304000000_refactor_portfolio_stats
--
-- Purpose:
--   Remove columns that are no longer stored in the database:
--     • total_contributions  — now fetched live from GitHub GraphQL API
--     • hidden_projects_count — unpublished projects are counted directly
--                               from the `projects` table at runtime
--
--   Only `years_experience` remains as a human-managed value.
--
-- Final schema after this migration:
--   portfolio_stats
--   ───────────────
--   id               uuid         primary key
--   years_experience smallint     NOT NULL DEFAULT 0
--   created_at       timestamptz  NOT NULL DEFAULT now()
--   updated_at       timestamptz  NOT NULL DEFAULT now()
-- ──────────────────────────────────────────────────────────────────────────────

ALTER TABLE public.portfolio_stats
  DROP COLUMN IF EXISTS total_contributions;

ALTER TABLE public.portfolio_stats
  DROP COLUMN IF EXISTS hidden_projects_count;
