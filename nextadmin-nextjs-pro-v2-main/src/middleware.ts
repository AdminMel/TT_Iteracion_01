// src/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const AUTH_SECRET = process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET;

const PUBLIC = new Set([
  "/", "/auth/signin", "/api/health",
  "/favicon.ico", "/icon.svg", "/robots.txt",
  "/site.webmanifest", "/manifest.webmanifest",
]);

export async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  // deja pasar internos, estáticos y auth
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname.startsWith("/images") ||
    pathname.startsWith("/api/auth") ||
    PUBLIC.has(pathname)
  ) return NextResponse.next();

  // protege el resto
  const token = await getToken({ req, secret: AUTH_SECRET });
  if (!token) {
    const signInUrl = new URL("/auth/signin", req.url);
    const cb = pathname.startsWith("/auth/") ? "/" : pathname + (search || "");
    signInUrl.searchParams.set("callbackUrl", cb);
    return NextResponse.redirect(signInUrl);
  }
  return NextResponse.next();
}

export const config = { matcher: ["/((?!_next|static).*)"] };
