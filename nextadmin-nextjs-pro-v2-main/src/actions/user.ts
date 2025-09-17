"use server";
import prisma from "@/libs/prismaDb";           // usa import default (como en otros archivos)
import { isAuthorized } from "@/libs/isAuthorized";

export async function getUsers(filter?: string) {
  const currentUser = await isAuthorized();

  // Si hay filtro, buscamos usuarios que tengan al menos un rol que coincida.
  // Ajusta 'name' o 'role' según tu modelo UserRole.
  const where: any = filter
    ? {
        roles: {
          some: {
            OR: [
              { name: filter }, // si tu tabla de roles tiene 'name'
              { role: filter }, // o si usa 'role' (enum/string)
            ],
          },
        },
      }
    : {};

  const res = await prisma.user.findMany({ where });

  const filteredUsers = res.filter(
    (user) =>
      user.email &&
      user.email !== (currentUser?.email ?? "") &&
      !user.email.includes("demo-"),
  );

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
