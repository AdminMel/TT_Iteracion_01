"use server";
import prisma from "@/libs/prismaDb";
import { isAuthorized } from "@/libs/isAuthorized";

export async function getUsers(filter?: string) {
  const currentUser = await isAuthorized(); // { id: string } (sin email en este entorno)
  const currentId = currentUser?.id ?? null;

  // Filtro por relación 'roles' (ajusta 'name' o 'role' según tu esquema)
  const where: any = filter
    ? {
        roles: {
          some: {
            OR: [{ name: filter }, { role: filter }],
          },
        },
      }
    : {};

  const res = await prisma.user.findMany({ where });

  // Compara por id y luego aplica el "no demo-" por email del usuario listado
  const filteredUsers = res.filter((user) => {
    const email = user.email ?? "";
    return user.id !== currentId && !email.includes("demo-");
  });

  return filteredUsers;
}

export async function updateUser(data: any) {
  const email = String(data?.email ?? "").toLowerCase();
  if (!email) throw new Error("Email requerido");

  await prisma.user.update({
  where: { email: email.toLowerCase() },
  // 👇 casteamos 'data' a any para que TS no se queje; no cambia tu BD
  data: ({ 
    passwordResetToken: resetToken, 
    passwordResetTokenExp 
  } as any),
});

}

export async function deleteUser(user: any) {
  const email = String(user?.email ?? "").toLowerCase();
  if (!email) throw new Error("User not found");
  if (email.includes("demo-")) return new Error("Can't delete demo user");

  return await prisma.user.delete({ where: { email } });
}

export async function searchUser(email: string) {
  const e = String(email ?? "").toLowerCase();
  if (!e) return null;
  return await prisma.user.findUnique({ where: { email: e } });
}
