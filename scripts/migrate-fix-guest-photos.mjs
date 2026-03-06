/**
 * Jalankan: node scripts/migrate-fix-guest-photos.mjs
 *
 * Script ini HANYA menjalankan migration perbaikan is_approved untuk
 * foto tamu yang sudah ada di database. Tidak mereset database.
 */

import pg from "pg"
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"
import dotenv from "dotenv"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(__dirname, "../.env.local") })

const connStr = process.env.POSTGRES_URL_NON_POOLING || ""
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
  const migFile = path.join(
    __dirname,
    "../supabase/migrations/20260320000000_fix_guest_photos_approval.sql"
  )
  const sql = fs.readFileSync(migFile, "utf-8")

  try {
    console.log("🔌 Connecting to Supabase Postgres...")
    await client.connect()
    console.log("✅ Connected!")
    console.log("🚀 Running: 20260320000000_fix_guest_photos_approval.sql")
    await client.query(sql)
    console.log("✅ Migration berhasil! Semua foto tamu kini auto-approved.")
  } catch (err) {
    console.error("❌ Migration gagal:", err.message)
  } finally {
    await client.end()
    console.log("🔒 Connection closed.")
  }
}

run()
