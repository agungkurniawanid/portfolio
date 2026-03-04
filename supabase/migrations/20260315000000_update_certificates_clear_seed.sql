-- ============================================================
-- MIGRATION: Clear Certificate Seed Data
-- Date: 2026-03-15
-- Run via: npm run migrate:certificates
-- Idempotent (safe to re-run)
--
-- PURPOSE:
--   Remove all placeholder / seed rows that were inserted by the
--   original 20260306000000 migration.  The table and storage
--   bucket remain in place — only the dummy data is removed.
--   Real certificate data will be entered via admin tools.
-- ============================================================

-- Clear every row (seed data only — table stays intact)
DELETE FROM public.certificates;
