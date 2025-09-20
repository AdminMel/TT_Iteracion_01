// src/lib/auth.ts
import type { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import prisma from "@/libs/prismaDb";
import { gescoLogin } from "@/lib/gescoLogin";

const isDev = process.env.NODE_ENV !== "production";

/**
 * Provider de credenciales (GESCO)
 * - NO hay bypass.
 * - Devuelve null cuando GESCO no valida (NextAuth responde 401).
 * - Siempre retorna un email "safe" para poder upsert en BD.
 */
const credentialsProvider = Credentials({
  id: "credentials",
  name: "GESCO",
  credentials: {
    username: { label: "Usuario / Boleta", type: "text" },
    password: { label: "Contraseña", type: "password" },
  },
  async authorize(credentials): Promise<any> {
    const username = credentials?.username?.trim();
    const password = credentials?.password ?? "";
    if (!username || !password) {
      throw new Error("Faltan credenciales");
    }

    try {
      const r = await gescoLogin(username, password);
      if (!r?.ok || !r.user) {
        // Credenciales inválidas o error aguas-arriba
        if (isDev) console.warn("[AUTH] gescoLogin NOT OK:", r?.error ?? "(sin detalle)");
        return null; // ⟶ NextAuth enviará 401 (CredentialsSignin)
      }

      const u = r.user!;
      const emailSafe = u.email || `${u.boleta ?? username}@placeholder.local`;

      return {
        id: String(u.boleta || username),
        name: u.nombre ?? username,
        email: emailSafe,
        boleta: u.boleta,
        nombre: u.nombre,
        carrera: u.carrera,
        accessToken: u.token ?? null,
      } as any;
    } catch (e: any) {
      if (isDev) console.error("[AUTH] Error en authorize/gescoLogin:", e);
      // Trátalo como credenciales inválidas para no filtrar detalles al cliente
      return null;
    }
  },
}) as any;

export const authOptions: NextAuthOptions = {
  // IMPORTANTE en producción detrás de proxy (Render)
  trustHost: true,

  secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET,

  debug: isDev,
  logger: isDev
    ? {
        error: (...m) => console.error("[NextAuth][error]", ...m),
        warn:  (...m) => console.warn("[NextAuth][warn]", ...m),
        debug: (...m) => console.log("[NextAuth][debug]", ...m),
      }
    : undefined,

  session: { strategy: "jwt" },

  // Página de login
  pages: { signIn: "/auth/signin" },

  providers: [credentialsProvider],

  callbacks: {
    /**
     * Se ejecuta tras authorize() OK.
     * Crea/actualiza usuario y perfil del alumno.
     */
    async signIn({ user }) {
      const boleta = (user as any).boleta as string | undefined;
      const email  = (user as any).email ?? null;
      const nombre = (user as any).nombre ?? null;
      if (!boleta) return false;

      const safeEmail = email ?? `${boleta}@placeholder.local`;
      (user as any).email = safeEmail;

      // Usuario base
      const upUser = await prisma.user.upsert({
        where:  { email: safeEmail },
        update: { name: nombre ?? undefined, active: true },
        create: { email: safeEmail, name: nombre ?? boleta, active: true },
        select: { id: true },
      });

      // Perfil alumno
      await prisma.perfilAlumno.upsert({
        where:  { userId: upUser.id },
        update: { boleta },
        create: { boleta, userId: upUser.id },
      });

      (user as any).__dbId = upUser.id;
      return true;
    },

    /**
     * Redirección tras login
     */
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return baseUrl + url;
      try {
        const u = new URL(url);
        if (u.origin === baseUrl) return url;
      } catch {}
      return baseUrl + "/";
    },

    /**
     * Mete info al JWT cuando hay user (primer paso)
     */
    async jwt({ token, user }) {
      if (user) {
        const dbId = (user as any).__dbId as string | undefined;
        if (dbId) (token as any).userId = dbId;

        const safeEmail = (user as any).email ?? token.email;
        token.email   = safeEmail;
        token.boleta  = (user as any).boleta  ?? (token as any).boleta;
        token.nombre  = (user as any).nombre  ?? (token as any).nombre;
        token.carrera = (user as any).carrera ?? (token as any).carrera;
        (token as any).roles = ["ALUMNO"];
      }
      return token;
    },

    /**
     * Expone campos útiles en session.user
     */
    async session({ session, token }) {
      (session as any).userId = (token as any).userId as string | undefined;
      session.user = {
        ...(session.user ?? {}),
        id:    (token as any).userId as string | undefined,
        roles: (token as any).roles ?? ["ALUMNO"],
        name:  session.user?.name  ?? (token as any).nombre ?? null,
        email: session.user?.email ?? (token.email as string | undefined) ?? null,
        image: session.user?.image ?? null,
      } as any;

      (session.user as any).boleta  = (token as any).boleta;
      (session.user as any).nombre  = (token as any).nombre;
      (session.user as any).carrera = (token as any).carrera;
      return session;
    },
  },
};
