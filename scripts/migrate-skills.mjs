// Run: npm run migrate:skills
//
// Script ini akan:
//   1. Membuat tabel skills beserta kolom (name, category, icon_key, icon_color,
//      level, display_order, is_published)
//   2. Membuat index performa + trigger auto-update updated_at
//   3. Mengaktifkan Row Level Security + policies (read-only public)
//   4. Menyisipkan 38 seed skill dari halaman Skills
//
// ✅ AMAN dijalankan berulang — semua pernyataan bersifat idempotent
//    (CREATE ... IF NOT EXISTS, ON CONFLICT DO NOTHING)

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
  "../supabase/migrations/20260305000000_create_skills_table.sql"
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

    console.log("🚀 Menjalankan migration skills...\n")
    await client.query(sql)

    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    console.log("✅ Migration selesai!\n")
    console.log("📋 Yang sudah dibuat:")
    console.log("   ✓ Extension: uuid-ossp")
    console.log("   ✓ Tabel: skills")
    console.log("   ✓ Index performa (category, is_published)")
    console.log("   ✓ Trigger: auto-update updated_at")
    console.log("   ✓ Row Level Security (read-only public policies)")
    console.log("")
    console.log("📦 Data seed:")
    console.log("   ✓  9 skill Frontend")
    console.log("   ✓ 10 skill Backend")
    console.log("   ✓  7 skill AI/ML")
    console.log("   ✓  1 skill Mobile")
    console.log("   ✓  5 skill DevOps")
    console.log("   ✓  4 skill Database")
    console.log("   ✓  2 skill Cloud")
    console.log("   ✓ Total: 38 skill")
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n")
  } catch (err) {
    console.error("\n❌ Migration gagal:", err.message)
    if (err.detail) console.error("   Detail:", err.detail)
    process.exit(1)
  } finally {
    await client.end()
  }
}

runMigration()
