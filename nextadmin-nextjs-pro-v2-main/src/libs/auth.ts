// src/server/auth.ts (o donde tengas esto)
import { prisma } from "@/libs/prismaDb";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import type { NextAuthOptions, DefaultSession } from "next-auth";
import { getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GitHubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import EmailProvider from "next-auth/providers/email";
import bcrypt from "bcrypt";

// ------------ Tipos extendidos ------------
import type { JWT } from "next-auth/jwt";
import type { User as PrismaUser } from "@prisma/client";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: DefaultSession["user"] & {
      id: string;
      roles: string[];          // códigos de rol (p. ej., ["ADMIN","ALUMNO"])
      avatarUrl?: string | null;
      coverUrl?: string | null;
      bio?: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    uid?: string;
    roles?: string[];
    avatarUrl?: string | null;
    coverUrl?: string | null;
    bio?: string | null;
  }
}

// ------------ Config ------------
export const authOptions: NextAuthOptions = {
  pages: {
    signIn: "/auth/signin", // asegúrate que tu ruta sea /auth/signin
  },
  adapter: PrismaAdapter(prisma),
  // Recomendado por NextAuth: usa NEXTAUTH_SECRET
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },

  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "text", placeholder: "jhondoe@email.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Please enter an email and password");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: {
            roles: { include: { role: true } }, // para derivar códigos
          },
        });



        // Devuelve el usuario Prisma; NextAuth lo pasará a jwt()
        return user as unknown as PrismaUser;
      },
    }),

    EmailProvider({
      server: {
        host: process.env.EMAIL_SERVER_HOST,
        port: Number(process.env.EMAIL_SERVER_PORT),
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
      },
      from: process.env.EMAIL_FROM,
    }),

    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID || "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
    }),

    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],

  callbacks: {
    // Se ejecuta al crear/actualizar el token JWT
    async jwt({ token, user, trigger, session }) {
      // on session.update() desde el cliente
      if (trigger === "update" && session?.user) {
        token.avatarUrl = session.user.image ?? token.avatarUrl ?? null;
        token.bio = "bio" in session.user ? (session.user as any).bio : token.bio ?? null;
        token.coverUrl =
          "coverUrl" in session.user ? (session.user as any).coverUrl : token.coverUrl ?? null;
        return token;
      }

      // Primer login: hidrata token con info del usuario
      if (user) {
        // user aquí es PrismaUser pero sin relaciones; reconsulta lo necesario
        const dbUser = await prisma.user.findUnique({
          where: { id: (user as any).id },
          include: {
            roles: { include: { role: true } },
          },
        });

        const roles = dbUser?.roles.map((r) => r.role.code) ?? [];
        token.uid = dbUser?.id;
        token.roles = roles;
        token.avatarUrl = (dbUser as any)?.avatarUrl ?? null; // mapea a tu campo avatar
        token.coverUrl = (dbUser as any)?.coverUrl ?? null;
        token.bio = (dbUser as any)?.bio ?? null;
      }

      return token;
    },

    // Se ejecuta en cada getSession() / useSession()
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.uid as string;
        session.user.roles = (token.roles as string[]) ?? [];
        session.user.image = (token.avatarUrl as string | null) ?? null; // NextAuth usa user.image
        session.user.avatarUrl = (token.avatarUrl as string | null) ?? null;
        session.user.coverUrl = (token.coverUrl as string | null) ?? null;
        session.user.bio = (token.bio as string | null) ?? null;
      }
      return session;
    },
  },

  // debug: process.env.NODE_ENV === "development",
};

export const getAuthSession = () => getServerSession(authOptions);
