# API — Gestión Parque Tecnológico (Neon + Vercel)

## Local

```bash
cp .env.example .env
# Completar DATABASE_URL y JWT_SECRET
npm install
npm run db:setup
npm run dev
```

## Producción

La API se despliega como función serverless en Vercel (`/api` en la raíz del monorepo).
No hace falta Render/Railway: mismo proyecto Vercel + Neon.

Variables en Vercel: `DATABASE_URL`, `JWT_SECRET`, `PUBLIC_BASE_URL`.

Los archivos de equipos se guardan en la tabla `archivo_blobs` de Neon (compatible con serverless; límite ~8 MB por archivo).
