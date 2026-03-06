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
  console.error("   Pastikan file .env.local ada dan berisi variabel tersebut.")
  process.exit(1)
}

// ─── Baca SQL migration ───────────────────────────────────────────────────────
const SQL_FILE = path.join(
  __dirname,
  "../supabase/migrations/20260308000000_create_work_experiences_table.sql"
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

    console.log("🚀 Menjalankan migration work_experiences...\n")
    await client.query(sql)

    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    console.log("✅ Migration selesai!\n")
    console.log("📋 Yang sudah dibuat:")
    console.log("   ✓ Extension: uuid-ossp")
    console.log("   ✓ Tabel: work_experiences")
    console.log("   ✓ Constraint: display_order UNIQUE")
    console.log("   ✓ Index performa (is_published, display_order, start_date)")
    console.log("   ✓ Trigger: auto-update updated_at")
    console.log("   ✓ Row Level Security (read-only public policies)")
    console.log("")
    console.log("📦 Data seed:")
    console.log("   ✓ Charoen Pokphand Indonesia — ICT Intern (Oct 2025 – Present)")
    console.log("   ✓ PT. BISI International, Tbk — Mobile Developer (Oct 2025 – Present)")
    console.log("   ✓ CV Dharma Adi Putra — Network Technician (Apr 2020 – Present)")
    console.log("   ✓ CV Dharma Adi Putra — Full Stack Developer (Apr 2020 – Oct 2025)")
    console.log("   ✓ JTI Innovation Center — Web Developer (Feb 2025 – Jul 2025)")
    console.log("   ✓ SOKO FINANCIAL — Full Stack Developer (Jun 2024 – Sep 2024)")
    console.log("   ✓ Total: 6 pengalaman kerja")
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
