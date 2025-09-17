// src/lib/gescoLogin.ts
const isDev = process.env.NODE_ENV !== "production";

export type GescoUser = {
  boleta: string;
  nombre: string;
  carrera: string;
  email?: string;
  token: string;
};

export type GescoLoginResult =
  | { ok: true; user: GescoUser }
  | { ok: false; message: string };

function readEnv() {
  const url = process.env.IPN_API_LOGIN_URL;
  const bearer = process.env.IPN_API_BEARER;
  if (!url || !bearer) throw new Error("GESCoConfigMissing");
  return { url, bearer };
}

export async function gescoLogin(
  username: string,
  password: string
): Promise<GescoLoginResult> {
  const { url, bearer } = readEnv();

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${bearer}`,
    },
    body: JSON.stringify({ username, password }), // cambia si tu API espera otros nombres
    cache: "no-store",
  });

  if (!res.ok) {
    if (isDev) console.log("[GESCO] HTTP fail", res.status, await res.text().catch(() => ""));
    return { ok: false, message: `GESCO HTTP ${res.status}` };
  }

  const data = await res.json().catch(() => null);
  if (isDev) console.log("[GESCO] raw response:", data);

  const raw = data?.datos;
  const estatus = data?.estatus;

  if (!raw) throw new Error("GESCOInvalidResponse");
  if (typeof estatus === "string" && estatus.toLowerCase() !== "true") {
    return { ok: false, message: "Credenciales inválidas (estatus=false)" };
  }

  const user: GescoUser = {
    boleta: String(raw.boleta ?? "").trim(),
    nombre: String(raw.nombre ?? raw.Nombre ?? "").trim(),
    carrera: String(raw.carrera ?? raw.Carrera ?? "").trim(),
    email: raw.mail ? String(raw.mail).trim() : undefined,
    token: String(raw["token."] ?? raw.token ?? "").trim(),
  };

  if (!user.boleta || !user.nombre || !user.carrera || !user.token) {
    if (isDev) console.log("[GESCO] mapped user incomplete:", user);
    throw new Error("GESCOInvalidResponse");
  }

  return { ok: true, user };
}
