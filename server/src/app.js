import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

import { requireAuth, resolveSede } from './middleware/auth.js'
import authRoutes from './routes/auth.js'
import sedesRoutes from './routes/sedes.js'
import equiposRoutes from './routes/equipos.js'
import mantenimientosRoutes from './routes/mantenimientos.js'
import eventosRoutes from './routes/eventos.js'
import stockRoutes from './routes/stock.js'
import usuariosRoutes from './routes/usuarios.js'
import reportesRoutes from './routes/reportes.js'
import uploadsRoutes, { getFileHandler } from './routes/uploads.js'

dotenv.config()

export function createApp() {
  const app = express()

  app.use(cors({ origin: true, credentials: true }))
  app.use(express.json({ limit: '12mb' }))

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true, service: 'gestion-parque-api' })
  })

  app.get('/api/uploads/file/:id', getFileHandler)

  app.use('/api/auth', authRoutes)

  app.use('/api', requireAuth)
  // Listar/crear sedes no exige sede activa (el Superusuario elige después)
  app.use('/api/sedes', sedesRoutes)

  app.use('/api', resolveSede)
  app.use('/api/equipos', equiposRoutes)
  app.use('/api/mantenimientos', mantenimientosRoutes)
  app.use('/api/eventos', eventosRoutes)
  app.use('/api/stock', stockRoutes)
  app.use('/api/usuarios', usuariosRoutes)
  app.use('/api/reportes', reportesRoutes)
  app.use('/api/uploads', uploadsRoutes)

  app.use((err, _req, res, _next) => {
    console.error(err)
    res.status(500).json({ error: err.message || 'Error interno' })
  })

  return app
}
