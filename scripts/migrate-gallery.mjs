// Run: node scripts/migrate-gallery.mjs
//
// Script ini akan:
//   1. Membuat ENUM: gallery_owner_type ('personal' | 'guest')
//   2. Membuat tabel   gallery_photos  (individual photo entries)
//   3. Membuat tabel   gallery_albums  (album groupings)
//   4. Membuat index performa + trigger auto-update updated_at
//   5. Mengaktifkan Row Level Security + policies
//   6. Menyisipkan sample data (7 foto + 4 album personal)
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
  "../supabase/migrations/20260309000000_create_gallery_table.sql"
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

    console.log("🚀 Menjalankan migration gallery...\n")
    await client.query(sql)

    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    console.log("✅ Migration selesai!\n")
    console.log("📋 Yang sudah dibuat:")
    console.log("   ✓ ENUM: gallery_owner_type ('personal' | 'guest')")
    console.log("   ✓ Tabel: gallery_photos")
    console.log("   ✓ Tabel: gallery_albums")
    console.log("   ✓ Index performa (owner_type, category, date, is_featured, is_approved)")
    console.log("   ✓ Trigger: auto-update updated_at")
    console.log("   ✓ Row Level Security (public read approved, guest insert pending)")
    console.log("")
    console.log("📦 Data seed:")
    console.log("   ✓ 7 foto personal di tabel gallery_photos")
    console.log("   ✓ 4 album di tabel gallery_albums")
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
  } catch (err) {
    console.error("❌ Migration gagal:", err.message)
    console.error(err)
    process.exit(1)
  } finally {
    await client.end()
  }
}

runMigration()
