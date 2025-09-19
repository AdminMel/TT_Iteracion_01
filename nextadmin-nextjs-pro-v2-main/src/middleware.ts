// middleware.ts
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

const AUTH_SECRET = process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET;

// Rutas públicas que no requieren sesión
const PUBLIC = [
  "/auth/signin",
  "/api/health",
  "/favicon.ico",
  "/robots.txt",
];

export async function middleware(req: NextRequest) {
  const { pathname, searchParams } = req.nextUrl;

  // Deja pasar assets/_next, rutas públicas y las de NextAuth
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/public") ||
    pathname.startsWith("/images") ||
    pathname.startsWith("/api/auth") || // IMPORTANTE: no proteger endpoints de next-auth
    PUBLIC.some(p => pathname === p || pathname.startsWith(p))
  ) {
    return NextResponse.next();
  }

  // Comprueba la sesión JWT con el MISMO secreto que en auth.ts
  const token = await getToken({ req, secret: AUTH_SECRET });

  if (!token) {
    // Evita loops: si el callback venía apuntando a /auth/* lo cambiamos al home
    const requested = pathname + (req.nextUrl.search || "");
    const cb = requested.startsWith("/auth/") ? "/" : requested;

    const url = new URL("/auth/signin", req.url);
    url.searchParams.set("callbackUrl", cb);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|static).*)"],
};
