// Run: node scripts/migrate-projects-thumbnails.mjs
//
// Script ini akan:
//   1. Membaca semua file JPEG dari src/assets/thumbnails/
//   2. Mengupload setiap gambar ke Supabase Storage bucket 'project-thumbnails'
//      (skip jika file sudah ada — idempotent)
//   3. Mengambil public URL dari Storage
//   4. UPDATE kolom thumbnail_url di tabel projects berdasarkan title
//
// ✅ AMAN dijalankan berulang (upsert storage + ON CONFLICT UPDATE)

import { createClient } from "@supabase/supabase-js"
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"
import dotenv from "dotenv"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(__dirname, "../.env.local") })

// ─── Validasi env ─────────────────────────────────────────────────────────────
const supabaseUrl  = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey  = process.env.SUPABASE_SERVICE_ROLE_KEY
                  || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ NEXT_PUBLIC_SUPABASE_URL atau SUPABASE_SERVICE_ROLE_KEY / NEXT_PUBLIC_SUPABASE_ANON_KEY tidak ditemukan di .env.local")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

const BUCKET      = "project-thumbnails"
const THUMB_DIR   = path.join(__dirname, "../src/assets/thumbnails")

// ─── Peta: filename → potongan judul proyek (untuk klausa WHERE LIKE) ─────────
// Urutan kolom: [filename, title_keyword]
const FILE_TITLE_MAP = [
  [
    "Intelligence-Quality-Air-Control-System-Greenhouse-Kopi-Nrsery-App.jpeg",
    "Intelligence Quality Air Control System",
  ],
  [
    "Emotional-Faces-Classification.jpeg",
    "Emotional Faces Classification",
  ],
  [
    "Marketplace-KampSewa_-Jual-Beli,-Sewa-dan-Menyewakan-Alat-Kamping-App.jpeg",
    "KampSewa",
  ],
  [
    "Speech-to-Speech-With-AI-ElevenLabs-App.jpeg",
    "Speech to Speech",
  ],
  [
    "Dapnetwork-(Old-Version)-App.jpeg",
    "Dapnetwork",
  ],
  [
    "Clock-App.jpeg",
    "Clock App",
  ],
  [
    "Electro-Mart-App.jpeg",
    "Electro Mart",
  ],
  [
    "QR-Code-Reader-App.jpeg",
    "QR Code Reader",
  ],
  [
    "HandyCraft-App.jpeg",
    "HandyCraft",
  ],
]

// ─── Helper: upload satu file ─────────────────────────────────────────────────
async function uploadFile(filename) {
  const filePath   = path.join(THUMB_DIR, filename)
  const fileBuffer = fs.readFileSync(filePath)

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(filename, fileBuffer, {
      contentType: "image/jpeg",
      upsert: true,          // overwrite kalau sudah ada → idempotent
    })

  if (error) {
    throw new Error(`Storage upload gagal (${filename}): ${error.message}`)
  }

  // Ambil public URL (tidak ada error — selalu berhasil jika bucket public)
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(filename)
  return data.publicUrl
}

// ─── Helper: update thumbnail_url di DB ──────────────────────────────────────
async function updateThumbnailUrl(titleKeyword, publicUrl) {
  const { error, count } = await supabase
    .from("projects")
    .update({ thumbnail_url: publicUrl })
    .ilike("title", `%${titleKeyword}%`)

  if (error) {
    throw new Error(`DB update gagal (${titleKeyword}): ${error.message}`)
  }
  return count
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function run() {
  console.log("\n📸 Memulai upload thumbnail proyek ke Supabase Storage...\n")
  console.log(`   Bucket : ${BUCKET}`)
  console.log(`   Source : ${THUMB_DIR}\n`)
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")

  let successCount = 0
  let failCount    = 0

  for (const [filename, titleKeyword] of FILE_TITLE_MAP) {
    const filePath = path.join(THUMB_DIR, filename)

    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  Skip (file tidak ada): ${filename}`)
      continue
    }

    process.stdout.write(`⬆️  Uploading: ${filename} ... `)

    try {
      const publicUrl = await uploadFile(filename)
      process.stdout.write(`✅\n`)

      process.stdout.write(`   🔗 URL    : ${publicUrl}\n`)
      process.stdout.write(`   📝 Update DB "${titleKeyword}" ... `)

      await updateThumbnailUrl(titleKeyword, publicUrl)
      process.stdout.write(`✅\n\n`)

      successCount++
    } catch (err) {
      process.stdout.write(`❌\n`)
      console.error(`   Error: ${err.message}\n`)
      failCount++
    }
  }

  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
  console.log(`\n✅ Selesai! Berhasil: ${successCount} | Gagal: ${failCount}`)

  if (successCount > 0) {
    console.log("\n🎉 Thumbnail sudah tersimpan di Supabase Storage.")
    console.log("   Home page Popular Projects akan menampilkan gambar dari Supabase CDN.\n")
  }

  if (failCount > 0) {
    console.log("⚠️  Beberapa file gagal. Periksa error di atas lalu jalankan ulang.")
    console.log("   Script ini idempotent — aman dijalankan berulang.\n")
    process.exit(1)
  }
}

run()
