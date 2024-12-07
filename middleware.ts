import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token");
  const isAuthPage = request.nextUrl.pathname.startsWith("/login") || 
                    request.nextUrl.pathname.startsWith("/register");
  const isPublicPage = request.nextUrl.pathname === "/" || 
                      request.nextUrl.pathname.startsWith("/about");

  // If user is authenticated (has token)
  if (token) {
    // Redirect away from auth pages (login/register) to matches
    if (isAuthPage) {
      return NextResponse.redirect(new URL("/matches", request.url));
    }
    // Allow access to protected pages
    return NextResponse.next();
  }

  // If user is not authenticated (no token)
  if (!token) {
    // Allow access to public and auth pages
    if (isPublicPage || isAuthPage) {
      return NextResponse.next();
    }
    // Redirect to login for all other pages
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};