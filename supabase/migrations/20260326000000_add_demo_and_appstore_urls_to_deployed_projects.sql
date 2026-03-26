-- Migration for deployed_projects table update
-- Adds demo_url and app_store_url columns

ALTER TABLE public.deployed_projects
ADD COLUMN IF NOT EXISTS demo_url TEXT,
ADD COLUMN IF NOT EXISTS app_store_url TEXT;
