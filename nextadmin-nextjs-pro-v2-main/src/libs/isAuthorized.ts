import "server-only";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth"; // Asegúrate de exportar tus NextAuthOptions desde aquí

/** Devuelve { id } del usuario autenticado o null si no hay sesión */
export async function isAuthorized() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;
  return { id: session.user.id as string };
}
