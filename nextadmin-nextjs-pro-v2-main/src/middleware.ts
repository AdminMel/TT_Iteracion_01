import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

const PUBLIC = [
  "/auth/signin",
  "/api/health",
  "/favicon.ico",
  "/robots.txt",
];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // deja pasar assets/_next y rutas públicas
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/images") ||
    pathname.startsWith("/public") ||
    PUBLIC.some(p => pathname === p || pathname.startsWith(p))
  ) {
    return NextResponse.next();
  }

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token) {
    const url = new URL("/auth/signin", req.url);
    url.searchParams.set("callbackUrl", req.nextUrl.pathname + req.nextUrl.search);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|static).*)"],
};
