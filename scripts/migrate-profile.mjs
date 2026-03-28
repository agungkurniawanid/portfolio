/**
 * Script untuk membuat atau memperbarui user admin di Supabase Auth
 * dan mengisi baris yang sesuai di public.profiles.
 *
 * Aman dijalankan berulang kali (idempoten):
 *   - Jika user belum ada: dibuat, trigger auto-isi profiles
 *   - Jika user sudah ada: metadata diperbarui, profiles di-upsert manual
 *
 * Jalankan: npm run create:auth-user
 *
 * Variabel di .env.local:
 *   NEXT_PUBLIC_SUPABASE_URL    -- wajib
 *   SUPABASE_SERVICE_ROLE_KEY   -- wajib
 *   AUTH_USER_EMAIL             -- wajib
 *   AUTH_USER_PASSWORD          -- wajib
 *   AUTH_USER_USERNAME          -- opsional (default: prefix email)
 *   AUTH_USER_ROLE              -- opsional (default: "developer")
 */

import { createClient } from "@supabase/supabase-js"
import { config } from "dotenv"
import path from "path"
import { fileURLToPath } from "url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
config({ path: path.join(__dirname, "../.env.local") })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const EMAIL = process.env.AUTH_USER_EMAIL
const PASSWORD = process.env.AUTH_USER_PASSWORD
const USERNAME = process.env.AUTH_USER_USERNAME || EMAIL?.split("@")[0] || "admin"
const ROLE = process.env.AUTH_USER_ROLE || "developer"

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("❌ Error: NEXT_PUBLIC_SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY wajib diset.")
  process.exit(1)
}
if (!EMAIL || !PASSWORD) {
  console.error("❌ Error: AUTH_USER_EMAIL dan AUTH_USER_PASSWORD wajib diset di .env.local.")
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const userMetadata = { username: USERNAME, role: ROLE }

// --- 1. Coba buat user baru ---
console.log(`🔐 Menyiapkan user: ${EMAIL}`)
const { data: createData, error: createError } = await supabase.auth.admin.createUser({
  email: EMAIL,
  password: PASSWORD,
  email_confirm: true,
  user_metadata: userMetadata,
})

let userId

if (!createError) {
  userId = createData.user.id
  console.log("✅ User baru berhasil dibuat.")
  console.log(`   ID    : ${userId}`)
  console.log(`   Email : ${createData.user.email}`)
} else {
  // User sudah ada — cari berdasarkan email
  const isAlreadyExists =
    createError.message?.toLowerCase().includes("already") ||
    createError.status === 422 ||
    createError.status === 409

  if (!isAlreadyExists) {
    console.error("❌ Gagal membuat user:", createError.message)
    process.exit(1)
  }

  console.log("ℹ️  User sudah ada, memperbarui data...")
  const { data: listData, error: listError } = await supabase.auth.admin.listUsers()
  if (listError) {
    console.error("❌ Gagal mengambil daftar user:", listError.message)
    process.exit(1)
  }

  const existing = listData?.users?.find((u) => u.email === EMAIL)
  if (!existing) {
    console.error("❌ User tidak ditemukan setelah dicari.")
    process.exit(1)
  }

  userId = existing.id

  // Update password dan metadata
  const { error: updateError } = await supabase.auth.admin.updateUserById(userId, {
    password: PASSWORD,
    user_metadata: userMetadata,
  })
  if (updateError) {
    console.error("❌ Gagal memperbarui user:", updateError.message)
    process.exit(1)
  }
  console.log(`✅ User diperbarui.`)
  console.log(`   ID    : ${userId}`)
  console.log(`   Email : ${EMAIL}`)
}

// --- 2. Upsert ke public.profiles ---
// Diperlukan jika trigger tidak terpicu (misal setelah reset database)
const { error: profileError } = await supabase
  .from("profiles")
  .upsert(
    { id: userId, username: USERNAME, role: ROLE },
    { onConflict: "id" }
  )

if (profileError) {
  console.error("❌ Gagal upsert profiles:", profileError.message)
  process.exit(1)
}

console.log(`✅ Profil tersinkron di public.profiles.`)
console.log(`   Username : ${USERNAME}`)
console.log(`   Role     : ${ROLE}`)
console.log("
🎉 Setup user selesai!")
