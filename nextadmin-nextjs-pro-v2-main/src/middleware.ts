// src/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const AUTH_SECRET = process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET;

export async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  // Permitir estáticos, next internals, API y auth
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/auth") ||
    pathname === "/favicon.ico" ||
    pathname.startsWith("/public") ||
    pathname.startsWith("/auth/signin") ||
    pathname.startsWith("/auth/callback")
  ) {
    return NextResponse.next();
  }

  const token = await getToken({ req, secret: AUTH_SECRET });

  if (!token) {
    const signInUrl = new URL("/auth/signin", req.url);
    signInUrl.searchParams.set("callbackUrl", pathname + search);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|api/auth|favicon.ico|auth/signin|auth/callback|public).*)"],
};
