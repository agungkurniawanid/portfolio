// Jalankan: node scripts/migrate-all.mjs

import pg from "pg"
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"
import dotenv from "dotenv"
import { createClient } from "@supabase/supabase-js"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(__dirname, "../.env.local") })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

const migrationsDir = path.join(__dirname, "../supabase/migrations")
const sqlFiles = fs.readdirSync(migrationsDir)
  .filter(f => f.endsWith(".sql"))
  .sort()

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

// Daftar bucket sesuai gambar yang kamu berikan
const targetBuckets = [
  "gallery-guests",
  "gallery-photos",
  "certificates",
  "project-thumbnails",
  "guestbook-avatars",
  "author-avatars",
  "blog-thumbnails"
]

async function cleanAllStorageBuckets() {
  console.log("🧹 Mengosongkan Supabase Storage...")
  
  for (const bucket of targetBuckets) {
    // emptyBucket() menghapus SEMUA file di dalam bucket tanpa menghapus bucket itu sendiri
    const { error } = await supabase.storage.emptyBucket(bucket)
    
    if (error) {
      console.error(`❌ Gagal mengosongkan bucket '${bucket}':`, error.message)
    } else {
      console.log(`✅ Bucket kosong: ${bucket}`)
    }
  }
}

async function run() {
  try {
    // 1. Kosongkan semua storage bucket lebih dulu
    await cleanAllStorageBuckets()

    console.log("🔌 Connecting to Supabase Postgres...")
    await client.connect()
    console.log("✅ Connected!")

    // 2. Eksekusi file reset jika ada (untuk wipe database)
    const resetFile = sqlFiles.find(f => f.toLowerCase().includes("reset"))
    if (resetFile) {
      const resetPath = path.join(migrationsDir, resetFile)
      console.log(`🧹 Fresh migration (Database): ${resetFile}`)
      const resetSql = fs.readFileSync(resetPath, "utf-8")
      try {
        await client.query(resetSql)
        console.log(`✅ Sukses reset database: ${resetFile}`)
      } catch (err) {
        console.error(`❌ Gagal reset database: ${resetFile} — ${err.message}`)
        throw err 
      }
    }

    // 3. Jalankan migrasi tabel-tabel baru
    for (const file of sqlFiles) {
      if (resetFile && file === resetFile) continue
      const filePath = path.join(migrationsDir, file)
      console.log(`🚀 Migrating: ${file}`)
      const sql = fs.readFileSync(filePath, "utf-8")
      try {
        await client.query(sql)
        console.log(`✅ Sukses: ${file}`)
      } catch (err) {
        console.error(`❌ Gagal: ${file} — ${err.message}`)
        break 
      }
    }
    
    console.log("🎉 Migrate Fresh selesai total!")
    
  } catch (err) {
    console.error("❌ Migration gagal:", err.message)
  } finally {
    await client.end()
    console.log("🔒 Connection closed.")
  }
}

run()