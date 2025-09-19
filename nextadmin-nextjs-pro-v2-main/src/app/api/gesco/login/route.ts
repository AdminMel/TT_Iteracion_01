import { NextResponse } from "next/server";

const normKey = (k: string) => k.toLowerCase().replace(/\s+/g, "").replace(/\./g, "");
const isTrue = (v: unknown) => typeof v === "string" && v.trim().toLowerCase().startsWith("true");
const pick = <T = unknown>(obj: Record<string, unknown>, aliases: string[]): T | undefined => {
  const t = new Map<string, unknown>();
  for (const [k, v] of Object.entries(obj)) t.set(normKey(k), v);
  for (const a of aliases) { const v = t.get(normKey(a)); if (v != null) return v as T; }
  return undefined;
};

export async function POST(req: Request) {
  const { username, password } = await req.json();
  if (!username || !password) {
    return NextResponse.json({ ok: false, message: "Missing credentials" }, { status: 400 });
  }

  const url = process.env.IPN_API_LOGIN_URL!;
  const bearer = process.env.IPN_API_BEARER!;
  const USER_KEY = process.env.GESCO_USER_KEY || "usuario";      // default sensato
  const PASS_KEY = process.env.GESCO_PASS_KEY || "contrasena";   // default sensato
  const BODY_FORMAT = (process.env.GESCO_BODY_FORMAT || "json").toLowerCase();
  const EXTRA = (() => {
    try { return JSON.parse(process.env.GESCO_EXTRA || "{}"); } catch { return {}; }
  })();

  if (!url || !bearer) {
    return NextResponse.json({ ok: false, message: "Missing GESCO config" }, { status: 500 });
  }

  // Construir el cuerpo con las llaves reales que pide GESCO
  const payload: Record<string, string> = {
    [USER_KEY]: String(username),
    [PASS_KEY]: String(password),
    ...Object.fromEntries(Object.entries(EXTRA).map(([k, v]) => [k, String(v)])),
  };

  // Envío según formato requerido
  let res = await fetch(url, {
    method: "POST",
    headers:
      BODY_FORMAT === "form"
        ? { "Content-Type": "application/x-www-form-urlencoded", Authorization: `Bearer ${bearer}`, Accept: "application/json" }
        : { "Content-Type": "application/json", Authorization: `Bearer ${bearer}`, Accept: "application/json" },
    body: BODY_FORMAT === "form" ? new URLSearchParams(payload).toString() : JSON.stringify(payload),
    cache: "no-store",
  });

  const text = await res.text();
  let json: any;
  try { json = JSON.parse(text); } catch {
    console.error("GESCO non-JSON:", text?.slice(0, 300));
    return NextResponse.json({ ok: false, message: "Non-JSON response", raw: text }, { status: 502 });
  }

  const ok = isTrue(json?.ecstatus ?? json?.status);
  if (!ok) {
    const msg = typeof json?.datos === "string" ? json.datos : "Credenciales inválidas";
    return NextResponse.json({ ok: false, message: msg }, { status: 200 });
  }

  const datos = json?.datos ?? {};
  const clean = (v: any) => (typeof v === "string" ? v.trim() : v);
  const user = {
    boleta: clean(pick(datos, ["boleta", "bolecta", "bolec"])),
    email:  clean(pick(datos, ["wmail", "wapl", "correo", "email"])),
    nombre: clean(pick(datos, ["nombre", "nowbrec", "name"])),
    carrera:clean(pick(datos, ["carrera", "carrecra", "programa"])),
    token:  clean(pick(datos, ["token", "tokec", "tokec."])),
  };

  // Log de depuración (no expone password)
  if (process.env.NODE_ENV !== "production") {
    console.log("[GESCO] Body keys used:", Object.keys(payload));
    console.log("[GESCO] Response ok:", ok, "user:", { ...user, token: user.token ? "***" : undefined });
  }

  return NextResponse.json({ ok: true, user }, { status: 200 });
}
