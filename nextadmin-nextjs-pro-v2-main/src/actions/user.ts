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

  return await prisma.user.update({
    where: { email },
    data: { ...data, email },
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

export async function resetUserPassword(email: string, resetToken: string, passwordResetTokenExp: Date) {
  return await prisma.user.update({
    where: {
      email: email.toLowerCase(),
    },
    data: {
      // Prisma no reconoce estos campos, los casteamos como any
      ...(resetToken ? ({ passwordResetToken: resetToken } as any) : {}),
      ...(passwordResetTokenExp ? ({ passwordResetTokenExp } as any) : {}),
    },
  });
}

