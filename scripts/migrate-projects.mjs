// Run: npm run migrate:projects
//
// Script ini akan:
//   1. Membuat tabel  projects, project_github_urls, project_images, popular_projects
//   2. Membuat index performa + trigger auto-update updated_at
//   3. Mengaktifkan Row Level Security + policies (read-only public)
//   4. Membuat Supabase Storage bucket: project-thumbnails (public)
//   5. Menyisipkan 9 data proyek beserta 16 GitHub URL dan popular_projects slots
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
  "../supabase/migrations/20260302000000_create_projects_tables.sql"
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

    console.log("🚀 Menjalankan migration projects...\n")
    await client.query(sql)

    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    console.log("✅ Migration selesai!\n")
    console.log("📋 Yang sudah dibuat:")
    console.log("   ✓ Extension: uuid-ossp")
    console.log("   ✓ Tabel: projects")
    console.log("   ✓ Tabel: project_github_urls  (FK → projects)")
    console.log("   ✓ Tabel: project_images       (FK → projects)")
    console.log("   ✓ Tabel: popular_projects     (FK → projects)")
    console.log("   ✓ Index performa (published, category, year, popular order)")
    console.log("   ✓ Trigger: auto-update updated_at")
    console.log("   ✓ Row Level Security (read-only public policies)")
    console.log("   ✓ Storage bucket: project-thumbnails (public)")
    console.log("   ✓ Storage policies (read / upload / delete)")
    console.log("")
    console.log("📦 Data seed:")
    console.log("   ✓  9 proyek di tabel projects")
    console.log("   ✓ 16 GitHub URL di tabel project_github_urls")
    console.log("   ✓  9 slot popular di tabel popular_projects")
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    console.log("")
    console.log("📸 Langkah selanjutnya:")
    console.log("   1. Upload thumbnail ke Storage bucket 'project-thumbnails'")
    console.log("   2. Salin public URL dari setiap gambar")
    console.log("   3. UPDATE public.projects SET thumbnail_url = '<url>' WHERE id = '<uuid>'")
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
