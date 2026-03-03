// Run: node scripts/migrate-guestbook-fix-rls.mjs
//
// Fix: RLS INSERT policy yang menyebabkan "new row violates row-level security"
//      karena subquery recursive ke tabel guestbook sendiri.

import pg from "pg"
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"
import dotenv from "dotenv"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(__dirname, "../.env.local") })

const connStr = process.env.POSTGRES_URL_NON_POOLING || ""
if (!connStr) {
  console.error("❌ POSTGRES_URL_NON_POOLING tidak ditemukan di .env.local")
  process.exit(1)
}

const SQL_FILE = path.join(
  __dirname,
  "../supabase/migrations/20260314000001_guestbook_fix_rls_insert.sql"
)

if (!fs.existsSync(SQL_FILE)) {
  console.error("❌ File SQL tidak ditemukan:", SQL_FILE)
  process.exit(1)
}

const sql = fs.readFileSync(SQL_FILE, "utf-8")

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

    console.log("🔧 Memperbaiki RLS INSERT policy guestbook...\n")
    await client.query(sql)

    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    console.log("✅ Fix selesai!\n")
    console.log("📋 Yang sudah diperbaiki:")
    console.log("   ✓ Policy INSERT lama (subquery recursive) → dihapus")
    console.log("   ✓ Policy INSERT baru (WITH CHECK (true)) → dibuat")
    console.log("")
    console.log("🔒 Proteksi duplikat tetap aktif via:")
    console.log("   ✓ UNIQUE constraint browser_fingerprint (DB level)")
    console.log("   ✓ App-level check di GuestbookFormModal sebelum insert")
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
