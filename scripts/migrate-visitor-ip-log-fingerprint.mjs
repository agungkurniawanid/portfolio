// Run: node scripts/migrate-visitor-ip-log-fingerprint.mjs
//
// Script ini akan:
//   1. Menambah kolom browser_fingerprint ke visitor_ip_log
//   2. Menghapus unique index lama (ip_address, action_type)
//   3. Membuat unique index baru (browser_fingerprint, action_type)
//      sehingga pengguna berbeda yang berbagi IP tidak saling memblokir
//
// ✅ AMAN dijalankan berulang — semua pernyataan bersifat idempotent

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
  "../supabase/migrations/20260313000000_visitor_ip_log_add_fingerprint.sql"
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

    console.log("🚀 Menjalankan migration visitor_ip_log (tambah browser_fingerprint)...\n")
    await client.query(sql)

    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    console.log("✅ Migration selesai!\n")
    console.log("📋 Yang sudah diperbarui:")
    console.log("   ✓ Kolom baru: browser_fingerprint (TEXT, nullable)")
    console.log("   ✓ Unique index lama (ip_address, action_type) → dihapus")
    console.log("   ✓ Unique index baru (browser_fingerprint, action_type)")
    console.log("   ✓ Index ip_address dipertahankan (non-unique)\n")
    console.log("🔒 Manfaat:")
    console.log("   ✓ Pengguna berbeda di IP yang sama tidak saling memblokir")
    console.log("   ✓ Orang yang sama ganti IP (VPN) tetap terdeteksi")
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
