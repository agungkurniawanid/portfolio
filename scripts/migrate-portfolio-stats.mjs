// Run: npm run migrate:portfolio-stats
//
// Script ini akan:
//   1. Membuat tabel portfolio_stats (singleton: years_experience, total_contributions, hidden_projects_count)
//   2. Mengaktifkan Row Level Security + policy (read-only public)
//   3. Membuat trigger auto-update updated_at
//   4. Menyisipkan baris seed awal
//   5. Membuat SECURITY DEFINER function get_hidden_projects_count()
//
// ✅ AMAN dijalankan berulang — semua pernyataan bersifat idempotent

import pg from "pg"
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"
import dotenv from "dotenv"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(__dirname, "../.env.local") })

// ─── Validasi env ─────────────────────────────────────────────────────────────
const connStr = process.env.POSTGRES_URL_NON_POOLING || ""
if (!connStr) {
  console.error("❌ POSTGRES_URL_NON_POOLING tidak ditemukan di .env.local")
  console.error("   Pastikan file .env.local ada dan berisi variabel tersebut.")
  process.exit(1)
}

// ─── Baca SQL migration ───────────────────────────────────────────────────────
const SQL_FILE = path.join(
  __dirname,
  "../supabase/migrations/20260303000000_create_portfolio_stats.sql"
)

if (!fs.existsSync(SQL_FILE)) {
  console.error("❌ File SQL tidak ditemukan:", SQL_FILE)
  process.exit(1)
}

const sql = fs.readFileSync(SQL_FILE, "utf-8")

// ─── Jalankan migration ────────────────────────────────────────────────────────
async function runMigration() {
  const parsedUrl = new URL(connStr.replace(/^postgres:\/\//, "postgresql://"))

  const client = new pg.Client({
    host: parsedUrl.hostname,
    port: Number(parsedUrl.port) || 5432,
    database: parsedUrl.pathname.replace("/", ""),
    user: parsedUrl.username,
    password: parsedUrl.password,
    ssl: { rejectUnauthorized: false },
  })

  try {
    console.log("\n🔌 Menghubungkan ke Supabase...")
    await client.connect()
    console.log("✅ Terhubung!\n")

    console.log("🚀 Menjalankan migration portfolio_stats...\n")
    await client.query(sql)

    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    console.log("✅ Migration selesai!\n")
    console.log("📋 Yang sudah dibuat:")
    console.log("   ✓ Tabel: portfolio_stats")
    console.log("      - years_experience      (admin-managed)")
    console.log("      - total_contributions   (admin-managed)")
    console.log("      - hidden_projects_count (private projects tidak publik)")
    console.log("   ✓ Trigger: auto-update updated_at")
    console.log("   ✓ Row Level Security (read-only public policy)")
    console.log("   ✓ Function: get_hidden_projects_count() [SECURITY DEFINER]")
    console.log("")
    console.log("📦 Data seed awal:")
    console.log("   ✓ years_experience      = 5")
    console.log("   ✓ total_contributions   = 24")
    console.log("   ✓ hidden_projects_count = 25")
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    console.log("")
    console.log("💡 Untuk mengubah nilai stats, jalankan di Supabase SQL Editor:")
    console.log("   UPDATE public.portfolio_stats")
    console.log("   SET years_experience = 6, total_contributions = 30, hidden_projects_count = 30;")
    console.log("")
    console.log("💡 Untuk sync hidden_projects_count otomatis dari tabel projects:")
    console.log("   UPDATE public.portfolio_stats")
    console.log("   SET hidden_projects_count = public.get_hidden_projects_count();")
    console.log("")
  } catch (err) {
    console.error("❌ Migration gagal:", err.message)
    console.error(err)
    process.exit(1)
  } finally {
    await client.end()
  }
}

runMigration()
