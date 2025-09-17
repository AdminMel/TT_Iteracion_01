// src/app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

const handler = NextAuth(authOptions);

// ✅ En App Router se exportan handlers nombrados:
export { handler as GET, handler as POST };

// ✅ NextAuth necesita Node runtime (no edge)
export const runtime = "nodejs";
