import prisma from "@/libs/prismaDb";
import { isAuthorized } from "@/libs/isAuthorized";

type ApiKeyClient = {
  findMany: (args: any) => Promise<any[]>;
  create: (args: any) => Promise<any>;
  delete: (args: any) => Promise<any>;
};

const apiKey = (prisma as unknown as { apiKey: ApiKeyClient }).apiKey;

export async function getApiKeys() {
  const user = await isAuthorized();
  return await apiKey.findMany({ where: { userId: user?.id as string } });
}

export async function createApiKey(name?: string) {
  const user = await isAuthorized();
  const key = crypto.randomUUID();
  return await apiKey.create({ data: { userId: user?.id as string, key, name } });
}

export async function deleteApiKey(id: string) {
  await apiKey.delete({ where: { id } });
  return { ok: true };
}
