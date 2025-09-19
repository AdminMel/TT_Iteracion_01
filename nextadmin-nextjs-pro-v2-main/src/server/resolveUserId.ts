import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/libs/prismaDb";

export async function resolveUserId() {
  const session = await getServerSession(authOptions);
  if (!session) return { userId: undefined, session: null };

  // 1) userId directo
  const direct = (session as any).userId as string | undefined;
  if (direct) return { userId: direct, session };

  // 2) id en session.user que parezca cuid
  const maybeId = session.user?.id;
  if (maybeId && /^[a-z0-9]{20,}$/i.test(maybeId)) {
    return { userId: maybeId, session };
  }

  // 3) por boleta
  const boleta = (session.user as any)?.boleta as string | undefined;
  if (boleta) {
    const pa = await prisma.perfilAlumno.findUnique({
      where: { boleta }, // si tienes @unique en boleta, también puedes probar por ahí
      select: { userId: true },
    });
    if (pa?.userId) return { userId: pa.userId, session };
  }

  // 4) por email o placeholder derivado de boleta
  let email = session.user?.email ?? undefined;
  if (!email && boleta) email = `${boleta}@placeholder.local`;

  if (email) {
    const u = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });
    if (u?.id) return { userId: u.id, session };
  }

  return { userId: undefined, session };
}
