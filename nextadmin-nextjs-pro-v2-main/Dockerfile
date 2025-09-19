# --- build ---
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate && npm run build

# --- run ---
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
# Render inyecta PORT (ej. 10000)
ENV PORT=3000
COPY --from=build /app ./
EXPOSE 3000
# Importante: NO añadimos -p aquí, lo hace el script start
CMD ["npm","run","start"]
