/*
  Warnings:

  - The primary key for the `PerfilAlumno` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The required column `id` was added to the `PerfilAlumno` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Made the column `boleta` on table `PerfilAlumno` required. This step will fail if there are existing NULL values in that column.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_PerfilAlumno" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "boleta" TEXT NOT NULL,
    "programa" TEXT,
    "semestre" INTEGER,
    "grupo" TEXT,
    "userId" TEXT,
    CONSTRAINT "PerfilAlumno_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_PerfilAlumno" ("boleta", "grupo", "programa", "semestre", "userId") SELECT "boleta", "grupo", "programa", "semestre", "userId" FROM "PerfilAlumno";
DROP TABLE "PerfilAlumno";
ALTER TABLE "new_PerfilAlumno" RENAME TO "PerfilAlumno";
CREATE UNIQUE INDEX "PerfilAlumno_boleta_key" ON "PerfilAlumno"("boleta");
CREATE UNIQUE INDEX "PerfilAlumno_userId_key" ON "PerfilAlumno"("userId");
CREATE INDEX "PerfilAlumno_boleta_idx" ON "PerfilAlumno"("boleta");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
