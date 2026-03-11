import { NextRequest, NextResponse } from "next/server"
import pg from "pg"
import path from "path"
import fs from "fs"

/**
 * POST /api/gallery/migrate
 * Menjalankan migration SQL untuk fitur Gallery Tamu.
 * Hanya bisa dijalankan di development (NODE_ENV !== 'production')
 * atau jika MIGRATION_SECRET cocok.
 *
 * Headers:
 *   Authorization: Bearer <MIGRATION_SECRET>
 *
 * MIGRATION_SECRET harus diset di .env.local
 */
export async function POST(req: NextRequest) {
  // Guard: hanya di development ATAU dengan secret yang benar
  const migrationSecret = process.env.MIGRATION_SECRET
  if (!migrationSecret) {
    return NextResponse.json(
      { error: "MIGRATION_SECRET tidak dikonfigurasi di environment variables." },
      { status: 500 }
    )
  }

  const authHeader = req.headers.get("authorization")
  const token = authHeader?.replace("Bearer ", "")

  const isDev = process.env.NODE_ENV === "development"

  if (!isDev && token !== migrationSecret) {
    return NextResponse.json(
      { error: "Unauthorized. Provide correct Authorization header." },
      { status: 401 }
    )
  }

  const connStr = process.env.POSTGRES_URL_NON_POOLING
  if (!connStr) {
    return NextResponse.json(
      { error: "POSTGRES_URL_NON_POOLING tidak ditemukan di environment variables." },
      { status: 500 }
    )
  }

  // Baca SQL dari file migration
  const sqlFilePath = path.join(
    process.cwd(),
    "supabase/migrations/20260310000000_guest_gallery_profiles.sql"
  )

  let sql: string
  try {
    sql = fs.readFileSync(sqlFilePath, "utf-8")
  } catch {
    return NextResponse.json(
      { error: `File SQL tidak ditemukan: ${sqlFilePath}` },
      { status: 500 }
    )
  }

  // Jalankan migration via pg
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
    await client.connect()
    await client.query(sql)
    await client.end()

    return NextResponse.json({
      success: true,
      message: "Migration berhasil dijalankan! Tabel gallery_guests dan kolom guest_id sudah siap.",
    })
  } catch (err: unknown) {
    await client.end().catch(() => {})
    const msg = err instanceof Error ? err.message : "Unknown error"
    console.error("[/api/gallery/migrate] error:", msg)
    return NextResponse.json(
      { error: `Migration gagal: ${msg}` },
      { status: 500 }
    )
  }
}

/**
 * GET /api/gallery/migrate
 * Info endpoint — tampilkan petunjuk cara menjalankan migration.
 */
export async function GET() {
  return NextResponse.json({
    info: "POST ke endpoint ini untuk menjalankan migration Gallery Tamu.",
    usage: "POST /api/gallery/migrate",
    headers: { Authorization: "Bearer <MIGRATION_SECRET dari .env.local>" },
    note: "Di development, Authorization header tidak diperlukan.",
    migration_file: "supabase/migrations/20260310000000_guest_gallery_profiles.sql",
    or_run_script: "node scripts/migrate-guest-gallery.mjs",
  })
}
