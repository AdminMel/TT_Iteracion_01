// middleware.ts
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

// Rutas públicas (no requieren sesión)
const PUBLIC_MATCHER =
  "/((?!_next|favicon.ico|images|public|auth/signin|api/health).*)";

export async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  // Deja pasar explícitamente lo público
  if (
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico" ||
    pathname.startsWith("/images") ||
    pathname.startsWith("/public") ||
    pathname.startsWith("/api/health") ||
    pathname.startsWith("/auth/signin")
  ) {
    return NextResponse.next();
  }

  // Comprueba el JWT de NextAuth
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // Sin sesión -> redirige a /auth/signin (sin bucles)
  if (!token) {
    const url = new URL("/auth/signin", req.url);
    url.searchParams.set("callbackUrl", pathname + search);
    return NextResponse.redirect(url);
  }

  // Con sesión -> continúa
  return NextResponse.next();
}

// Solo aplica el middleware donde toca (evita assets y la página de login)
export const config = {
  matcher: [PUBLIC_MATCHER],
};
