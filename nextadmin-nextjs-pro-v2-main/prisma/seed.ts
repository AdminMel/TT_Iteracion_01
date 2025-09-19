import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const roles = [
    { code: "ADMIN", name: "Administrador" },
    { code: "ALUMNO", name: "Alumno" },
    { code: "TUTOR", name: "Tutor" },
    { code: "DOCENTE", name: "Docente" },
    { code: "DEPORTE", name: "Encargado de deportes" },
  ];
  for (const r of roles) {
    await prisma.role.upsert({
      where: { code: r.code },
      update: {},
      create: r,
    });
  }
  console.log("✅ Roles seeded");
}

main().finally(() => prisma.$disconnect());
