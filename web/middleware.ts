import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// List of paths that don't require authentication
const publicPaths = ["/", "/signup", "/forgot-password"]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if the path is public
  if (publicPaths.some((path) => pathname === path)) {
    return NextResponse.next()
  }

  // Check for auth token in cookies first, then in localStorage as fallback
  const authToken = request.cookies.get("authToken")?.value

  // If no token and not on a public path, redirect to login
  if (!authToken) {
    const url = request.nextUrl.clone()
    url.pathname = "/"
    url.searchParams.set("redirectTo", pathname)
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

// Configure the middleware to run on specific paths
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
}
