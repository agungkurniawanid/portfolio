// run: node scripts/migrate-guest-gallery.mjs
//
// Script ini akan:
//   1. Membuat tabel gallery_guests (profil pengunjung Gallery Tamu)
//   2. Menambahkan kolom guest_id ke gallery_photos & gallery_albums
//   3. Membuat index performa + RLS policies
//   4. Membuat Storage buckets: gallery-guests & gallery-photos beserta policies
//
// ✅ AMAN dijalankan berulang — semua statements bersifat idempotent

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
  "../supabase/migrations/20260310000000_guest_gallery_profiles.sql"
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
    console.log("\n🔌 Menghubungkan ke Supabase Postgres...")
    await client.connect()
    console.log("✅ Terhubung!\n")

    console.log("🚀 Menjalankan migration: Guest Gallery Profiles...\n")
    await client.query(sql)
    console.log("✅ Migration berhasil!\n")

    console.log("📋 Verifikasi tabel gallery_guests...")
    const { rows } = await client.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'gallery_guests'
      ORDER BY ordinal_position;
    `)
    console.table(rows)

    console.log("\n📋 Verifikasi kolom guest_id di gallery_photos...")
    const { rows: photoCols } = await client.query(`
      SELECT column_name FROM information_schema.columns
      WHERE table_name = 'gallery_photos' AND column_name = 'guest_id';
    `)
    console.log(photoCols.length > 0 ? "  ✅ guest_id ada di gallery_photos" : "  ⚠️  guest_id BELUM ada di gallery_photos")

    console.log("\n📋 Verifikasi kolom guest_id di gallery_albums...")
    const { rows: albumCols } = await client.query(`
      SELECT column_name FROM information_schema.columns
      WHERE table_name = 'gallery_albums' AND column_name = 'guest_id';
    `)
    console.log(albumCols.length > 0 ? "  ✅ guest_id ada di gallery_albums" : "  ⚠️  guest_id BELUM ada di gallery_albums")

    console.log("\n🎉 Semua done! Gallery Tamu siap digunakan.\n")
  } catch (err) {
    console.error("\n❌ Migration gagal:", err.message)
    process.exit(1)
  } finally {
    await client.end()
  }
}

runMigration()
