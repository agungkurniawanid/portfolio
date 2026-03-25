// Run: npm run migrate:fix-certificates-rls
//
// Script ini akan:
//   1. Menambahkan RLS policy baru ke Supabase Storage bucket 'certificates'
//   2. Policy ini mengizinkan pengguna 'authenticated' untuk upload, update,
//      dan delete file.
//
// ✅ AMAN dijalankan berulang — policy memiliki 'IF NOT EXISTS'
//    dan tidak akan membuat duplikat.

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
const SQL_FILE_PATH = path.join(
  __dirname,
  "../supabase/migrations/20260325000000_fix_certificates_storage_rls.sql"
)

if (!fs.existsSync(SQL_FILE_PATH)) {
  console.error("❌ File SQL tidak ditemukan:", SQL_FILE_PATH)
  process.exit(1)
}

const sql = fs.readFileSync(SQL_FILE_PATH, "utf-8")

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

    console.log("🚀 Menjalankan migration: fix_certificates_storage_rls...")
    await client.query(sql)
    console.log("✅ Policy RLS untuk storage certificates berhasil ditambahkan.\n")

    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    console.log("✅ Migration selesai!\n")
    console.log("📋 Yang sudah dilakukan:")
    console.log("   ✓ Menambahkan policy untuk mengizinkan 'authenticated' user")
    console.log("     melakukan upload/update/delete di bucket 'certificates'.")
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
