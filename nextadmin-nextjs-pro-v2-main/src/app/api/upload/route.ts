export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { resolveUserId } from "@/server/resolveUserId";
import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";

function extFromMime(mime: string): string {
  // casos comunes
  if (mime === "image/jpeg") return ".jpg";
  if (mime === "image/png") return ".png";
  if (mime === "image/webp") return ".webp";
  if (mime === "image/gif") return ".gif";
  // fallback por si acaso
  const guess = mime.split("/")[1]?.split(";")[0] ?? "bin";
  return "." + guess;
}

export async function POST(req: Request) {
  const { userId, session } = await resolveUserId();
  if (!session) return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  if (!userId)   return NextResponse.json({ message: "User not found for this session" }, { status: 404 });

  const form = await req.formData().catch(() => null);
  if (!form) return NextResponse.json({ message: "Invalid form-data" }, { status: 400 });

  const file = form.get("file");
  const kind = String(form.get("kind") ?? "generic"); // "avatar" | "cover" | "generic"

  if (!(file instanceof File)) {
    return NextResponse.json({ message: "Missing file" }, { status: 400 });
  }

  // Validación simple
  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ message: "Only images allowed" }, { status: 415 });
  }
  // límite 10MB
  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ message: "Max 10MB" }, { status: 413 });
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const hash = crypto.createHash("sha1").update(bytes).digest("hex").slice(0, 10);
  const ext = extFromMime(file.type);
  const safeBase = kind === "avatar" ? "avatar" : kind === "cover" ? "cover" : "img";
  const filename = `${safeBase}-${Date.now()}-${hash}${ext}`;

  // Guardar en /public/uploads/users/<userId>/
  const dir = path.join(process.cwd(), "public", "uploads", "users", userId);
  await fs.mkdir(dir, { recursive: true });
  const absPath = path.join(dir, filename);
  await fs.writeFile(absPath, bytes);

  // URL pública
  const publicUrl = `/uploads/users/${userId}/${filename}`;

  return NextResponse.json({ ok: true, url: publicUrl, kind, name: file.name, type: file.type, size: file.size });
}
