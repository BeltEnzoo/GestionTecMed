# Gestión Parque Tecnológico

Sistema de gestión para equipos médicos y mantenimientos.

## Stack

- Frontend: React 19 + Vite (Vercel)
- API: Express como serverless function en Vercel (`/api`)
- Base de datos: Neon PostgreSQL

## Local

1. `server/.env` con `DATABASE_URL`, `JWT_SECRET`, `PORT=3001`
2. Raíz `.env` con `VITE_API_URL=http://localhost:3001`
3. Crear tablas: `npm run db:setup`
4. Dos terminales:

```bash
npm run dev:api
npm run dev
```

Login: `admin@hospital.com` / `admin123`

## Deploy en Vercel (solo Neon + Vercel)

1. Subí el repo a GitHub y conectalo en Vercel.
2. Variables de entorno en Vercel (Project → Settings → Environment Variables):

| Variable | Valor |
|----------|--------|
| `DATABASE_URL` | Connection string de Neon (pooled recomendado) |
| `JWT_SECRET` | Secreto largo aleatorio |
| `PUBLIC_BASE_URL` | `https://tu-dominio.vercel.app` |

No hace falta `VITE_API_URL` en producción: el frontend llama a `/api` en el mismo dominio.

3. Redeploy.
4. Si la DB es nueva: corré `npm run db:setup` una vez desde tu máquina apuntando al mismo `DATABASE_URL`.

## Backups

```bash
npm run backup
```

Guarda SQL en `server/backups/`.

## Roles

- **Administrador**: todo + usuarios
- **Técnico**: operaciones (sin usuarios)
- **Invitado**: solo lectura
