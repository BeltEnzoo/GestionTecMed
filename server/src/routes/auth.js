import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { z } from 'zod'
import { query } from '../db.js'
import { isSuperuser } from '../middleware/auth.js'

const router = Router()

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

async function mapUser(row) {
  let sede = null
  if (row.sede_id) {
    const { rows } = await query(
      `SELECT id, nombre, codigo, ciudad FROM sedes WHERE id = $1`,
      [row.sede_id]
    )
    sede = rows[0] || null
  }

  return {
    id: row.id,
    email: row.email,
    nombre: row.nombre,
    apellido: row.apellido,
    rol: row.rol,
    estado: row.estado,
    departamento: row.departamento,
    cargo: row.cargo,
    telefono: row.telefono,
    permisos: row.permisos || {},
    sede_id: row.sede_id || null,
    sede,
  }
}

async function listSedesForUser(user) {
  if (isSuperuser(user)) {
    const { rows } = await query(
      `SELECT id, nombre, codigo, ciudad, activa FROM sedes WHERE activa = TRUE ORDER BY nombre`
    )
    return rows
  }
  if (!user.sede_id) return []
  const { rows } = await query(
    `SELECT id, nombre, codigo, ciudad, activa FROM sedes WHERE id = $1`,
    [user.sede_id]
  )
  return rows
}

router.post('/login', async (req, res) => {
  try {
    const { email, password } = loginSchema.parse(req.body)

    const { rows } = await query(
      `SELECT * FROM perfiles_usuarios WHERE email = $1 LIMIT 1`,
      [email.toLowerCase().trim()]
    )

    const user = rows[0]
    if (!user) {
      return res.status(401).json({ error: 'Usuario no encontrado' })
    }

    if (user.estado !== 'Activo') {
      return res.status(401).json({ error: 'Usuario inactivo' })
    }

    const ok = await bcrypt.compare(password, user.password_hash)
    if (!ok) {
      return res.status(401).json({ error: 'Contraseña incorrecta' })
    }

    await query(
      `UPDATE perfiles_usuarios SET ultimo_acceso = NOW() WHERE id = $1`,
      [user.id]
    )

    const mapped = await mapUser(user)
    const sedes = await listSedesForUser(mapped)

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        rol: user.rol,
        sede_id: user.sede_id || null,
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.json({ token, user: mapped, sedes })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Datos inválidos',
        details: error.issues || error.errors,
      })
    }
    console.error('Login error:', error)
    res.status(500).json({ error: 'Error al iniciar sesión' })
  }
})

router.get('/me', async (req, res) => {
  try {
    const header = req.headers.authorization
    if (!header?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No autorizado' })
    }
    const payload = jwt.verify(header.slice(7), process.env.JWT_SECRET)
    const { rows } = await query(
      `SELECT * FROM perfiles_usuarios WHERE id = $1 LIMIT 1`,
      [payload.id]
    )
    if (!rows[0]) {
      return res.status(401).json({ error: 'Usuario no encontrado' })
    }
    const mapped = await mapUser(rows[0])
    const sedes = await listSedesForUser(mapped)
    res.json({ user: mapped, sedes })
  } catch {
    res.status(401).json({ error: 'Token inválido' })
  }
})

export default router
