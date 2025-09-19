# Render — Iteración 0 (Next.js + Prisma, subcarpeta)

Este `render.yaml` despliega la app que vive en:
`Iteración 0/Desarrollo/nextadmin-1.2.x/nextadmin-nextjs-pro-v2-main`

## Qué hace
- Usa **entorno Node** (no Docker).
- Fija **Node 20** para evitar incompatibilidades.
- Ejecuta `npm ci`, `npx prisma generate`, `npm run build`.
- Arranca con `npm run start -p $PORT`.
- Define `DATABASE_URL=file:./prisma/dev.db` para usar SQLite del repo.

> Importante: el filesystem en Render es efímero en el plan free.
> Si haces escrituras en la DB, se perderán al redeploy. Para producción, migra a Postgres (Neon/Render/Railway) y cambia `DATABASE_URL`.

## Pasos
1. Copia `render.yaml` en la **raíz del repo**.
2. Commit & push.
3. En Render → New → Web Service → selecciona el repo → Create.
4. Espera a que build + deploy terminen. La URL será `https://<app>.onrender.com`.
