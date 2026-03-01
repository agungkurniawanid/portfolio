// Run: node scripts/migrate.mjs
import pg from "pg"
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"
import dotenv from "dotenv"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(__dirname, "../.env.local") })

const sql = fs.readFileSync(
  path.join(__dirname, "../supabase-migration.sql"),
  "utf-8"
)

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
  try {
    console.log("🔌 Connecting to Supabase...")
    await client.connect()
    console.log("✅ Connected!")
    console.log("🚀 Running migration...")
    await client.query(sql)
    console.log("✅ Migration selesai! Tabel blogs berhasil dibuat.")
  } catch (err) {
    console.error("❌ Migration gagal:", err.message)
  } finally {
    await client.end()
  }
}

run()
