export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
// Ajusta estos imports a tus paths reales:
import prisma from "@/libs/prismaDb";
import { resolveUserId } from "@/server/resolveUserId";

// Normaliza lo guardado en BD hacia una URL servible por Next
function normalizePublicUrl(v?: string | null): string | null {
  if (!v) return null;
  const s = v.trim();
  // http/https, data:, blob:, o ya empieza con "/"
  if (/^(https?:|data:|blob:|\/)/i.test(s)) return s;
  // claves tipo "uploads/..." o "images/..." -> anteponer "/"
  if (/^(uploads|images)\//i.test(s)) return "/" + s;
  return "/" + s.replace(/^\/+/, "");
}

type ViewProfile = {
  id: string;
  name: string;
  email: string;
  boleta: string;
  image: string | null;     // avatarUrl
  coverUrl: string | null;
  bio: string;
  programa: string;
  interests: string[];
  links: Array<{
    id: string;
    type: any;
    url: string;
    username?: string | null;
    label?: string | null;
    isPublic: boolean;
    order: number;
  }>;
};

export async function GET() {
  const { userId, session } = await resolveUserId();
  if (!session) return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  if (!userId)   return NextResponse.json({ message: "User not found for this session" }, { status: 404 });

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      alumno: { select: { boleta: true, programa: true } },
      interests: { include: { interest: true } },
      links: true,
    },
  });
  if (!user) return NextResponse.json({ message: "User not found" }, { status: 404 });

  const vp: ViewProfile = {
    id: user.id,
    name: user.name,
    email: user.email,
    boleta: user.alumno?.boleta ?? "",
    image: normalizePublicUrl(user.avatarUrl),
    coverUrl: normalizePublicUrl(user.coverUrl),
    bio: user.bio ?? "",
    programa: user.alumno?.programa ?? "",
    interests: user.interests
      .map(ui => ui.interest.label)
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b)),
    links: (user.links ?? [])
      .map(l => ({
        id: l.id,
        type: l.type,
        url: l.url,
        username: l.username,
        label: l.label,
        isPublic: l.isPublic,
        order: l.order ?? 0,
      }))
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
  };

  return NextResponse.json(vp);
}
