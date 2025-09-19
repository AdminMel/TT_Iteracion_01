/*
  Warnings:

  - A unique constraint covering the columns `[boleta]` on the table `PerfilAlumno` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "PerfilAlumno_boleta_key" ON "PerfilAlumno"("boleta");
