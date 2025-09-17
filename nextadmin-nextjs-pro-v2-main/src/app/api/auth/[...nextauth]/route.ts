// src/app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth"; // <-- define esto en src/lib/auth.ts

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

// NextAuth necesita Node runtime (no edge)
export const runtime = "nodejs";
