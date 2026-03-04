// Run: npm run migrate:certificates
//
// Script ini akan:
//   1. Membuat tabel certificates beserta kolom (title, description, category,
//      issuer_name, issuer_logo_url, issue_date, expiry_date, status,
//      pdf_url, thumbnail_url, display_order, is_published)
//   2. Membuat index performa + trigger auto-update updated_at
//   3. Mengaktifkan Row Level Security + policies (read-only public)
//   4. Membuat Supabase Storage bucket: certificates (public, 20 MB, PDF + image)
//   5. Menyisipkan 12 seed sertifikat dari certificateData.ts
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
const SQL_CREATE = path.join(
  __dirname,
  "../supabase/migrations/20260306000000_create_certificates_table.sql"
)
const SQL_CLEAR = path.join(
  __dirname,
  "../supabase/migrations/20260315000000_update_certificates_clear_seed.sql"
)

for (const f of [SQL_CREATE, SQL_CLEAR]) {
  if (!fs.existsSync(f)) {
    console.error("❌ File SQL tidak ditemukan:", f)
    process.exit(1)
  }
}

const sqlCreate = fs.readFileSync(SQL_CREATE, "utf-8")
const sqlClear  = fs.readFileSync(SQL_CLEAR,  "utf-8")

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

    console.log("🚀 [1/2] Menjalankan migration: create_certificates_table...")
    await client.query(sqlCreate)
    console.log("✅ Tabel & storage bucket siap.\n")

    console.log("🧹 [2/2] Menjalankan migration: clear_seed_data...")
    await client.query(sqlClear)
    console.log("✅ Data seed dihapus — tabel sekarang kosong.\n")

    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    console.log("✅ Migration selesai!\n")
    console.log("📋 Yang sudah dilakukan:")
    console.log("   ✓ Extension: uuid-ossp")
    console.log("   ✓ Tabel: certificates (CREATE TABLE IF NOT EXISTS)")
    console.log("   ✓ Index performa (category, status, is_published, issue_date)")
    console.log("   ✓ Trigger: auto-update updated_at")
    console.log("   ✓ Row Level Security (read-only public policies)")
    console.log("   ✓ Storage bucket: certificates (public, 20 MB, PDF + image)")
    console.log("   ✓ Storage policies (public read, service_role write)")
    console.log("   ✓ Semua data seed dihapus — tabel kosong")
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
