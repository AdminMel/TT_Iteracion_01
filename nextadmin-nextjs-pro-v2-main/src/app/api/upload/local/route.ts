// src/app/api/upload/local/route.ts  (si lo usas)
import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export async function POST(req: Request) {
  const form = await req.formData();
  const file = form.get("file") as File | null;
  if (!file) return NextResponse.json({ message: "No file" }, { status: 400 });

  const bytes = Buffer.from(await file.arrayBuffer());
  const ext = path.extname(file.name) || ".bin";
  const name = `${Date.now()}${ext}`;
  const rel = `uploads/${name}`;
  const outPath = path.join(process.cwd(), "public", rel);

  await fs.mkdir(path.dirname(outPath), { recursive: true });
  await fs.writeFile(outPath, bytes);

  // key para guardar en BD
  return NextResponse.json({ key: rel }, { status: 200 });
}
