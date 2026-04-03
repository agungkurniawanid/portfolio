// Run: node scripts/migrate-diary.mjs
//
// Script ini akan:
//   1. DROP tabel diaries (semua data TERHAPUS)
//   2. Buat ulang tabel diaries dengan schema terbaru
//   3. Buat index untuk entry_date dan created_at
//   4. Set RLS policies untuk SELECT dan INSERT
//   5. Insert seed data: catatan diary pertama
//
// ⚠️  DATA LAMA AKAN TERHAPUS PERMANEN!
//
// Opsi: Jalankan dengan environment variable SKIP_CONFIRMATION untuk skip warning
//    SKIP_CONFIRMATION=true node scripts/migrate-diary.mjs

import pg from "pg"
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"
import dotenv from "dotenv"
import readline from "readline"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(__dirname, "../.env.local") })

const SQL_FILE = path.join(__dirname, "../supabase/migrations/20260329000000_create_diary_table.sql")

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

// ─── Check jika skip confirmation ──────────────────────────────────────────────────
const skipConfirmation = process.env.SKIP_CONFIRMATION === "true"

if (skipConfirmation) {
  runMigration()
} else {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
  rl.question(
    "\n⚠️  PERINGATAN: Semua data diary akan TERHAPUS PERMANEN!\n   Lanjutkan? (ketik 'ya' untuk konfirmasi): ",
    async (answer) => {
      rl.close()
      if (answer.trim().toLowerCase() !== "ya") {
        console.log("❌ Migration dibatalkan.")
        process.exit(0)
      }
      await runMigration()
    }
  )
}

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

    console.log("📕 Menjalankan migration diary table...\n")

    await client.query(sql)

    console.log("✅ Migration selesai!\n")
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    console.log("📋 Yang sudah dibuat:")
    console.log("   ✓ Tabel diaries dengan schema lengkap")
    console.log("   ✓ Kolom: id, title, content, entry_date, mood, tags, created_at, updated_at")
    console.log("   ✓ Index: entry_date DESC, created_at DESC")
    console.log("   ✓ Row Level Security (RLS) enabled")
    console.log("   ✓ Policy SELECT: public read access")
    console.log("   ✓ Policy INSERT: public insert access")
    console.log("   ✓ Seed data: 1 catatan diary awal")
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n")
    console.log("📖 Seed Entry Details:")
    console.log("   • ID: diary-001")
    console.log("   • Judul: Sahur, Bintang-Bintang, dan Cerita yang Tak Pernah Kehabisan Kata")
    console.log("   • Tanggal: 2026-01-28")
    console.log("   • Mood: Reflective 🤔")
    console.log("   • Tags: Ramadhan, kenangan, teman, kehidupan")
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n")
  } catch (err) {
    console.error("❌ Migration gagal:", err.message)
    console.error(err)
    process.exit(1)
  } finally {
    await client.end()
  }
}
