# --- build ---
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
# Si usas Prisma, evita migraciones en build; solo genera cliente
RUN npx prisma generate || true
RUN npm run build

# --- run ---
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copia lo mínimo para standalone
COPY --from=build /app/public ./public
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/prisma ./prisma

# Render necesita que el server escuche en 0.0.0.0:$PORT (default 10000)
ENV HOSTNAME=0.0.0.0
ENV PORT=10000
EXPOSE 10000

# Aumenta timeouts (evita 502 por “connection reset”)
ENV NEXT_HTTP_SERVER_KEEP_ALIVE_TIMEOUT=120000
ENV NEXT_HTTP_SERVER_HEADERS_TIMEOUT=120000

CMD ["node", "server.js"]
