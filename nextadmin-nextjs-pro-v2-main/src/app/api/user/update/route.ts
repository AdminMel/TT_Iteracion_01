// src/app/api/user/update/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import prisma from "@/libs/prismaDb";                 // ← ajusta si tu path es distinto
import { resolveUserId } from "@/server/resolveUserId";
import { LinkType, Prisma } from "@prisma/client";

// ---------------- utils ----------------
function normalizeStoredUrl(v: unknown): string | null {
  if (v == null) return null;
  let s = String(v).trim();
  if (!s) return null;
  // Absolutas o data/blob o ya con "/"
  if (/^(https?:|data:|blob:|\/)/i.test(s)) return s;
  // claves tipo "uploads/..." o "images/..."
  if (/^(uploads|images)\//i.test(s)) return "/" + s;
  // último recurso
  return "/" + s.replace(/^\/+/, "");
}

function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const LINK_TYPES = new Set(Object.keys(LinkType));

function parseBoolean(v: unknown): boolean | undefined {
  if (v === undefined || v === null) return undefined;
  if (typeof v === "boolean") return v;
  const s = String(v).trim().toLowerCase();
  if (s === "true" || s === "1" || s === "yes" || s === "si" || s === "sí") return true;
  if (s === "false" || s === "0" || s === "no") return false;
  return undefined;
}

function parseIntOrUndefined(v: unknown): number | undefined {
  if (v === undefined || v === null || v === "") return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

// --------------- tipos de entrada ---------------
type LinkIn = {
  type?: string; // WEBSITE | GITHUB | ...
  url: string;
  username?: string | null;
  label?: string | null;
  isPublic?: boolean;
  order?: number | null;
};

type BodyIn = {
  name?: string;
  bio?: string | null;
  avatarUrl?: string | null;
  coverUrl?: string | null;
  interests?: string[];   // ["videojuegos","matemáticas"]
  links?: LinkIn[];       // reemplaza todo el set
};

// --------------- handler ---------------
export async function POST(req: Request) {
  const { userId, session } = await resolveUserId();
  if (!session) return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  if (!userId)   return NextResponse.json({ message: "User not found for this session" }, { status: 404 });

  // ⚠️ Parseamos y casteamos el body una sola vez (sin 'unknown')
  const body = (await req.json().catch(() => ({}))) as Partial<BodyIn>;

  // ---- User fields ----
  const dataUser: Prisma.UserUpdateInput = {};
  if (body.name      !== undefined) dataUser.name      = String(body.name);
  if (body.bio       !== undefined) dataUser.bio       = body.bio === null ? null : String(body.bio);
  if (body.avatarUrl !== undefined) dataUser.avatarUrl = normalizeStoredUrl(body.avatarUrl);
  if (body.coverUrl  !== undefined) dataUser.coverUrl  = normalizeStoredUrl(body.coverUrl);

  // ---- Interests (strings) ----
  let interests: string[] | undefined;
  if (Array.isArray(body.interests)) {
    interests = Array.from(
      new Set(
        body.interests
          .map((s) => (s == null ? "" : String(s).trim()))
          .filter((s) => s.length > 0)
      )
    );
  }

  // ---- Links ----
  let links: LinkIn[] | undefined;
  if (Array.isArray(body.links)) {
    links = body.links
      .map((l) => ({
        type: l?.type ? String(l.type).trim().toUpperCase() : "OTHER",
        url: l?.url ? String(l.url).trim() : "",
        username: l?.username ?? null,
        label: l?.label ?? null,
        isPublic: l?.isPublic,
        order: l?.order ?? null,
      }))
      .filter((l) => l.url.length > 0)
      .map((l) => ({ ...l, type: LINK_TYPES.has(l.type!) ? l.type! : "OTHER" }))
      .filter((l, i, arr) => arr.findIndex((x) => x.type === l.type && x.url === l.url) === i);
  }

  try {
    const user = await prisma.$transaction(async (tx) => {
      // 1) update básico
      if (Object.keys(dataUser).length > 0) {
        await tx.user.update({ where: { id: userId }, data: dataUser });
      }

      // 2) intereses (Interest + UserInterest)
      if (interests) {
        const pairs = interests.map((label) => ({ label, slug: slugify(label) }));

        // upsert por slug único
        const ensured = await Promise.all(
          pairs.map(({ label, slug }) =>
            tx.interest.upsert({
              where: { slug },
              update: { label },
              create: { slug, label },
              select: { id: true },
            })
          )
        );

        await tx.userInterest.deleteMany({ where: { userId } });
        if (ensured.length > 0) {
          await tx.userInterest.createMany({
            data: ensured.map((i) => ({ userId, interestId: i.id })),
          });
        }
      }

      // 3) links (replace-all)
      if (links) {
        await tx.userLink.deleteMany({ where: { userId } });
        if (links.length > 0) {
          const data = links.map((l) => ({
            userId,
            type: (LINK_TYPES.has(l.type!) ? l.type! : "OTHER") as LinkType,
            url: l.url,
            username: l.username ?? null,
            label: l.label ?? null,
            isPublic: parseBoolean(l.isPublic) ?? true,
            order: parseIntOrUndefined(l.order) ?? null,
          })) as Prisma.UserLinkCreateManyInput[];

          await tx.userLink.createMany({ data });
        }
      }

      // 4) devolver perfil con relaciones
      return tx.user.findUnique({
        where: { id: userId },
        include: {
          interests: { include: { interest: true } },
          links: true,
        },
      });
    });

    return NextResponse.json({ ok: true, user });
  } catch (e: any) {
    console.error("[/api/user/update] error:", e);
    return NextResponse.json({ ok: false, message: e?.message || "Update failed" }, { status: 500 });
  }
}
