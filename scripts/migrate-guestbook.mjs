// Run: node scripts/migrate-guestbook.mjs
import pg from "pg"
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"
import dotenv from "dotenv"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(__dirname, "../.env.local") })

const sql = fs.readFileSync(
  path.join(__dirname, "../supabase/migrations/20240101000000_create_guestbook_table.sql"),
  "utf-8"
)

const connStr = process.env.POSTGRES_URL_NON_POOLING || ""
if (!connStr) {
  console.error("❌ POSTGRES_URL_NON_POOLING tidak ditemukan di .env.local")
  process.exit(1)
}

const url = new URL(connStr.replace("postgres://", "postgresql://"))

const client = new pg.Client({
  host: url.hostname,
  port: Number(url.port) || 5432,
  database: url.pathname.replace("/", ""),
  user: url.username,
  password: url.password,
  ssl: { rejectUnauthorized: false },
})

async function run() {
  try {
    console.log("🔌 Connecting to Supabase...")
    await client.connect()
    console.log("✅ Connected!")
    console.log("🚀 Running guestbook migration...")
    await client.query(sql)
    console.log("✅ Migration selesai! Tabel guestbook berhasil dibuat.")
    console.log("")
    console.log("📌 Langkah selanjutnya:")
    console.log("   1. Buat storage bucket 'guestbook-avatars' (public) di Supabase Dashboard")
    console.log("   2. Aktifkan Realtime untuk tabel guestbook di Supabase Dashboard > Database > Replication")
  } catch (err) {
    if (err.message?.includes("already exists")) {
      console.warn("⚠️  Tabel atau objek sudah ada, migration dilewati:", err.message)
    } else {
      console.error("❌ Migration gagal:", err.message)
      process.exit(1)
    }
  } finally {
    await client.end()
  }
}

run()
