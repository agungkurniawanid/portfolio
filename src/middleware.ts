import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

const LOGIN_ROUTE = "/xhub"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Hanya protect route /dashboard
  if (!pathname.startsWith("/dashboard")) {
    return NextResponse.next()
  }

  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Gunakan getUser() bukan getSession() — lebih aman karena validasi ke server Supabase
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.redirect(new URL(LOGIN_ROUTE, request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: ["/dashboard/:path*"],
}
