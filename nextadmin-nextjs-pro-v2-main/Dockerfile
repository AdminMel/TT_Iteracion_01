# ---------- Base de dependencias ----------
FROM node:20-alpine AS deps
WORKDIR /app

# Algunas libs utiles en alpine
RUN apk add --no-cache libc6-compat

# Copia manifiestos y resuelve dependencias (usa npm; ver notas para yarn/pnpm)
COPY package.json package-lock.json* ./
RUN npm ci --no-audit --no-fund

# ---------- Build ----------
FROM node:20-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Si usas Prisma, genera el cliente (no falla si no existe)
RUN if [ -f prisma/schema.prisma ]; then npx prisma generate; fi

# Construye Next en modo producción (crea .next/standalone)
ENV NODE_ENV=production
RUN npm run build

# ---------- Runner (imagen final ligera) ----------
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
# Render inyecta $PORT; Next usa PORT y HOSTNAME
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

# Copia el artefacto "standalone" y los assets estáticos
#   - .next/standalone contiene node_modules podados y server.js
#   - .next/static contiene assets del cliente
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
# (opcional) si tu server lee package.json en runtime
COPY --from=builder /app/package.json ./package.json

# (opcional) healthcheck simple (requiere curl)
RUN apk add --no-cache curl
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD curl -f http://127.0.0.1:${PORT}/ || exit 1

EXPOSE 3000

# En standalone, el entrypoint es server.js en la raíz que acabamos de copiar
CMD ["node", "server.js"]
