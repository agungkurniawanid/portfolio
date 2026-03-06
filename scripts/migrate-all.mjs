import pg from "pg"
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"
import dotenv from "dotenv"
import { createClient } from "@supabase/supabase-js"
import { execSync } from "child_process"

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

const targetBuckets = [
  "gallery-guests",
  "gallery-photos",
  "certificates",
  "project-thumbnails",
  "guestbook-avatars",
  "author-avatars",
  "blog-thumbnails",
  "timeline",
  "project-files" // 👈 Bucket untuk fitur Deployed Projects sudah ditambahkan
]

async function cleanAllStorageBuckets() {
  console.log("🧹 Mengosongkan Supabase Storage...")
  for (const bucket of targetBuckets) {
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
    await cleanAllStorageBuckets()
    console.log("🔌 Connecting to Supabase Postgres...")
    await client.connect()
    console.log("✅ Connected!")
    
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
    console.log("🎉 Migrate Fresh selesai total!\n")

    // 👇 PROSES AUTO SEEDING DATA
    console.log("🌱 Menjalankan Seeding Data (Timeline)...")
    try {
      execSync("node scripts/migrate-timeline.mjs", { stdio: "inherit" })
      console.log("✅ Auto-Seeding Timeline berhasil diselesaikan!\n")
    } catch (err) {
      console.error("❌ Auto-Seeding Timeline gagal dijalankan.")
    }

    console.log("🌱 Menjalankan Seeding Data (Tech Tools)...")
    try {
      execSync("node scripts/migrate-tech-tools.mjs", { stdio: "inherit" })
      console.log("✅ Auto-Seeding Tech Tools berhasil diselesaikan!\n")
    } catch (err) {
      console.error("❌ Auto-Seeding Tech Tools gagal dijalankan.")
    }

    // 👈 TAMBAHAN UNTUK DEPLOYED PROJECTS
    console.log("🌱 Menjalankan Seeding Data (Deployed Projects)...")
    try {
      execSync("node scripts/migrate-deployed-projects.mjs", { stdio: "inherit" })
      console.log("✅ Auto-Seeding Deployed Projects berhasil diselesaikan!\n")
    } catch (err) {
      console.error("❌ Auto-Seeding Deployed Projects gagal dijalankan.")
    }
    // 👆 SAMPAI SINI

    console.log("🌱 Menjalankan Seeding Storage (Project Thumbnails)...")
    try {
      execSync("node scripts/migrate-projects-thumbnails.mjs", { stdio: "inherit" })
      console.log("✅ Auto-Seeding Project Thumbnails berhasil diselesaikan!\n")
    } catch (err) {
      console.error("❌ Auto-Seeding Project Thumbnails gagal dijalankan.")
    }

  } catch (err) {
    console.error("❌ Migration gagal:", err.message)
  } finally {
    await client.end()
    console.log("🔒 Connection closed.")
  }
}
run()