export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { resolveUserId } from "@/server/resolveUserId";

export async function GET() {
  const { userId, session } = await resolveUserId();
  return NextResponse.json({
    ok: !!session,
    userId: userId ?? null,
    sessionUser: session?.user ?? null,
  });
}
