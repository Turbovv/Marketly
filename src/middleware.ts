import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const jwtToken = request.cookies.get("token")?.value;

  const nextAuthToken =
    request.cookies.get("__Secure-authjs.session-token")?.value ||
    request.cookies.get("authjs.session-token")?.value;

  const protectedRoutes = ["/chat", "/cart", "/create"];

  const authRoutes = ["/login", "/register", "/confirm", "/forgot-password"];

  const isProtected = protectedRoutes.some((route) =>
    request.nextUrl.pathname.startsWith(route)
  );

  const isAuthRoute = authRoutes.some((route) =>
    request.nextUrl.pathname.startsWith(route)
  );

  // Redirect unauthenticated users from protected routes to /login
  if (isProtected && !jwtToken && !nextAuthToken) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Redirect authenticated users away from auth pages (login/register/etc.) to /
  if (isAuthRoute && (jwtToken || nextAuthToken)) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/chat/:path*",
    "/cart/:path*",
    "/create/:path*",
    "/login/:path*",
    "/register/:path*",
    "/confirm/:path*",
    "/forgot-password/:path*",
  ],
};