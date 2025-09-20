// src/lib/auth.ts (solo la parte del provider)
const credentialsProvider = Credentials({
  id: "credentials",
  name: "GESCO",
  credentials: {
    username: { label: "Usuario / Boleta", type: "text" },
    password: { label: "Contraseña", type: "password" },
  },
  async authorize(credentials): Promise<any> {
    const username = credentials?.username?.trim();
    const password = credentials?.password ?? "";
    if (!username || !password) throw new Error("Faltan credenciales");

    // BYPASS de diagnóstico (ACTÍVALO en Render con AUTH_BYPASS=1 y prueba una vez)
    if (process.env.AUTH_BYPASS === "1") {
      console.warn("[AUTH] BYPASS habilitado — aceptando cualquier credencial");
      return {
        id: username,
        name: username,
        email: `${username}@placeholder.local`,
        boleta: username,
        nombre: username,
        carrera: "TEST",
        accessToken: "bypass",
      };
    }

    try {
      const r = await gescoLogin(username, password).catch((e: any) => {
        console.error("[AUTH] gescoLogin lanzó:", e);
        return { ok: false, error: String(e) };
      });

      if (!r?.ok) {
        console.warn("[AUTH] gescoLogin NO ok:", r?.error ?? "(sin detalle)");
        return null; // NextAuth ⟶ 401 CredentialsSignin
      }

      const u = r.user!;
      return {
        id: String(u.boleta || username),
        name: u.nombre ?? null,
        email: u.email ?? null,
        boleta: u.boleta,
        nombre: u.nombre,
        carrera: u.carrera,
        accessToken: u.token,
      } as any;
    } catch (e: any) {
      console.error("[AUTH] Error inesperado en authorize:", e);
      throw new Error("Error de autenticación");
    }
  },
}) as any;
