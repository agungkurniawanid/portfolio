// One-shot migration script using Supabase JS client (service_role)
// Run: node scripts/migrate-notifications.mjs

import { createClient } from "@supabase/supabase-js"
import { readFileSync } from "fs"
import { resolve, dirname } from "path"
import { fileURLToPath } from "url"
import { config } from "dotenv"

const __dir = dirname(fileURLToPath(import.meta.url))
config({ path: resolve(__dir, "../.env.local") })

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !serviceKey) {
  console.error("❌ NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY missing in .env.local")
  process.exit(1)
}

const supabase = createClient(url, serviceKey, { auth: { persistSession: false } })

async function run() {
  console.log("🚀 Running notifications table migration via Supabase RPC...")

  // Check if table already exists
  const { data: tableCheck } = await supabase
    .from("notifications")
    .select("id")
    .limit(1)
    .maybeSingle()

  if (tableCheck !== undefined && tableCheck !== null) {
    console.log("✅ Table 'notifications' already exists. Skipping creation.")
    process.exit(0)
  }

  // Use pg_catalog check — table doesn't exist, create it via RPC
  // Supabase doesn't expose raw SQL over REST, so we use a workaround:
  // We'll use storage admin or create via Supabase dashboard.
  // Instead, let's try a simple insert that will fail gracefully if no table.

  console.log("⚠️  Table 'notifications' does not exist yet.")
  console.log("")
  console.log("📋 Please run the following SQL in your Supabase SQL Editor:")
  console.log("   → Go to: https://supabase.com/dashboard/project/_/sql/new")
  console.log("")
  
  const sql = readFileSync(resolve(__dir, "../supabase/migrations/20260328000000_create_notifications.sql"), "utf8")
  console.log("─".repeat(70))
  console.log(sql)
  console.log("─".repeat(70))
  
  console.log("")
  console.log("💡 After running the SQL, the notification system will work automatically.")
}

run().catch(console.error)
