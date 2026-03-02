// Run: node scripts/migrate-refactor-portfolio-stats.mjs
//
// Drops the deprecated `total_contributions` and `hidden_projects_count`
// columns from portfolio_stats.  Safe to re-run (uses IF EXISTS).

import pg from "pg";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../.env.local") });

const sql = `
ALTER TABLE public.portfolio_stats
  DROP COLUMN IF EXISTS total_contributions;

ALTER TABLE public.portfolio_stats
  DROP COLUMN IF EXISTS hidden_projects_count;
`;

const connStr = process.env.POSTGRES_URL_NON_POOLING || "";
const url = new URL(connStr.replace("postgres://", "postgresql://"));

const client = new pg.Client({
  host: url.hostname,
  port: Number(url.port) || 5432,
  database: url.pathname.replace("/", ""),
  user: url.username,
  password: url.password,
  ssl: { rejectUnauthorized: false },
});

async function run() {
  try {
    console.log("🔌 Connecting to Supabase...");
    await client.connect();
    console.log("✅ Connected!");
    console.log("🚀 Running migration: drop total_contributions & hidden_projects_count ...");
    await client.query(sql);
    console.log("✅ Migration complete — columns dropped successfully.");
  } catch (err) {
    console.error("❌ Migration failed:", err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

run();
