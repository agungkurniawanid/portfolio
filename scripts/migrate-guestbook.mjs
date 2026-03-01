// Run: node scripts/migrate-guestbook.mjs
//
// Script ini akan:
//   1. DROP tabel guestbook (semua data TERHAPUS)
//   2. Buat ulang tabel dengan schema terbaru (kolom contact, avatar_url, dll.)
//   3. Buat / update storage bucket guestbook-avatars
//   4. Set RLS policies & Realtime
//
// ⚠️  DATA LAMA AKAN TERHAPUS PERMANEN!

import pg from "pg"
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"
import dotenv from "dotenv"
import readline from "readline"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(__dirname, "../.env.local") })

const SQL_FILE = path.join(__dirname, "../supabase/migrations/reset_guestbook.sql")

if (!fs.existsSync(SQL_FILE)) {
  console.error("❌ File SQL tidak ditemukan:", SQL_FILE)
  process.exit(1)
}

const sql = fs.readFileSync(SQL_FILE, "utf-8")

const connStr = process.env.POSTGRES_URL_NON_POOLING || ""
if (!connStr) {
  console.error("❌ POSTGRES_URL_NON_POOLING tidak ditemukan di .env.local")
  process.exit(1)
}

// ─── Konfirmasi sebelum reset ──────────────────────────────────────────────────
const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
rl.question(
  "\n⚠️  PERINGATAN: Semua data guestbook akan TERHAPUS PERMANEN!\n   Lanjutkan? (ketik 'ya' untuk konfirmasi): ",
  async (answer) => {
    rl.close()
    if (answer.trim().toLowerCase() !== "ya") {
      console.log("❌ Migration dibatalkan.")
      process.exit(0)
    }
    await runMigration()
  }
)

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

    console.log("🗑️  Menghapus tabel guestbook lama...")
    console.log("🚀 Menjalankan full reset migration...\n")

    await client.query(sql)

    console.log("✅ Migration selesai!\n")
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    console.log("📋 Yang sudah dibuat:")
    console.log("   ✓ Tabel guestbook (schema terbaru + kolom contact)")
    console.log("   ✓ Index performa (created_at, fingerprint, rating, mood, contact)")
    console.log("   ✓ Row Level Security policies")
    console.log("   ✓ Trigger auto-update updated_at")
    console.log("   ✓ Realtime enabled")
    console.log("   ✓ Storage bucket: guestbook-avatars (public)")
    console.log("   ✓ Storage policies (read / upload / delete)")
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n")
  } catch (err) {
    console.error("❌ Migration gagal:", err.message)
    console.error(err)
    process.exit(1)
  } finally {
    await client.end()
  }
}

