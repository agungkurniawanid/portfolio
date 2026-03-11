import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json(
        { message: "Email dan password wajib diisi" },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { data, error } = await supabase.auth.signInWithPassword({
      email: username.trim().toLowerCase(),
      password,
    })

    if (error || !data.user) {
      return NextResponse.json(
        { message: "Email atau password tidak valid" },
        { status: 401 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("[auth/login]", err)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}

// Blokir method selain POST
export async function GET() {
  return NextResponse.json({ message: "Method not allowed" }, { status: 405 })
}
