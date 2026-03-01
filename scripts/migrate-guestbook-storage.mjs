// Run: node scripts/migrate-guestbook-storage.mjs
import { createClient } from "@supabase/supabase-js"
import path from "path"
import { fileURLToPath } from "url"
import dotenv from "dotenv"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(__dirname, "../.env.local") })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  console.error("❌ NEXT_PUBLIC_SUPABASE_URL atau SUPABASE_SERVICE_ROLE_KEY tidak ditemukan di .env.local")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false },
})

async function run() {
  console.log("🔌 Connecting to Supabase Storage...")

  // ── 1. Buat bucket guestbook-avatars ──────────────────────
  console.log("\n📦 Membuat bucket 'guestbook-avatars'...")
  const { data: bucket, error: bucketError } = await supabase.storage.createBucket(
    "guestbook-avatars",
    { public: true, allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"], fileSizeLimit: 2097152 }
  )

  if (bucketError) {
    if (bucketError.message?.includes("already exists") || bucketError.message?.toLowerCase().includes("duplicate")) {
      console.log("ℹ️  Bucket 'guestbook-avatars' sudah ada, skip.")
    } else {
      console.error("❌ Gagal membuat bucket:", bucketError.message)
      process.exit(1)
    }
  } else {
    console.log("✅ Bucket 'guestbook-avatars' berhasil dibuat!")
  }

  // ── 2. Verifikasi bucket public ────────────────────────────
  const { data: buckets, error: listErr } = await supabase.storage.listBuckets()
  if (!listErr) {
    const gb = buckets.find((b) => b.id === "guestbook-avatars")
    if (gb) {
      console.log(`✅ Bucket terverifikasi: id=${gb.id}, public=${gb.public}`)
    }
  }

  console.log("\n🎉 Migration storage guestbook selesai!")
  console.log("   Bucket 'guestbook-avatars' siap digunakan.")
}

run()
