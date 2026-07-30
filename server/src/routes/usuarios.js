import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { query } from '../db.js'
import { requireRole, requireWriteAccess } from '../middleware/auth.js'

const router = Router()

function mapUser(row) {
  if (!row) return null
  return {
    id: row.id,
    userId: row.id,
    email: row.email,
    nombre: row.nombre,
    apellido: row.apellido,
    telefono: row.telefono,
    departamento: row.departamento,
    cargo: row.cargo,
    rol: row.rol,
    estado: row.estado,
    fechaIngreso: row.fecha_ingreso,
    ultimoAcceso: row.ultimo_acceso,
    permisos: row.permisos || {},
    avatarUrl: row.avatar_url,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

router.use(requireRole('Administrador'))

router.get('/', async (_req, res) => {
  try {
    const { rows } = await query(
      `SELECT id, email, nombre, apellido, telefono, departamento, cargo, rol,
              estado, fecha_ingreso, ultimo_acceso, permisos, avatar_url,
              created_at, updated_at
       FROM perfiles_usuarios
       ORDER BY created_at DESC`
    )
    res.json({ data: rows.map(mapUser) })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: error.message })
  }
})

router.get('/stats', async (_req, res) => {
  try {
    const { rows } = await query(`
      SELECT
        COUNT(*)::int AS total,
        COUNT(*) FILTER (WHERE estado = 'Activo')::int AS activos,
        COUNT(*) FILTER (WHERE rol = 'Administrador')::int AS administradores,
        COUNT(*) FILTER (WHERE rol = 'Técnico')::int AS tecnicos,
        COUNT(*) FILTER (WHERE rol = 'Invitado')::int AS invitados
      FROM perfiles_usuarios
    `)
    res.json({ data: rows[0] })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: error.message })
  }
})

router.get('/:id', async (req, res) => {
  try {
    const { rows } = await query(
      `SELECT id, email, nombre, apellido, telefono, departamento, cargo, rol,
              estado, fecha_ingreso, ultimo_acceso, permisos, avatar_url,
              created_at, updated_at
       FROM perfiles_usuarios WHERE id = $1`,
      [req.params.id]
    )
    if (!rows[0]) return res.status(404).json({ error: 'No encontrado' })
    res.json({ data: mapUser(rows[0]) })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: error.message })
  }
})

router.post('/', requireWriteAccess, async (req, res) => {
  try {
    const b = req.body
    if (!b.email || !b.password || !b.nombre || !b.apellido) {
      return res.status(400).json({ error: 'email, password, nombre y apellido son requeridos' })
    }
    const hash = await bcrypt.hash(b.password, 10)
    const { rows } = await query(
      `INSERT INTO perfiles_usuarios (
        email, password_hash, nombre, apellido, telefono, departamento, cargo,
        rol, estado, fecha_ingreso, permisos, avatar_url, created_by
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
      RETURNING id, email, nombre, apellido, telefono, departamento, cargo, rol,
                estado, fecha_ingreso, ultimo_acceso, permisos, avatar_url,
                created_at, updated_at`,
      [
        String(b.email).toLowerCase().trim(),
        hash,
        b.nombre,
        b.apellido,
        b.telefono ?? null,
        b.departamento ?? null,
        b.cargo ?? null,
        b.rol || 'Invitado',
        b.estado || 'Activo',
        b.fecha_ingreso || b.fechaIngreso || new Date().toISOString().split('T')[0],
        JSON.stringify(b.permisos || {}),
        b.avatar_url || b.avatarUrl || null,
        req.user?.id || null,
      ]
    )
    res.status(201).json({ data: mapUser(rows[0]) })
  } catch (error) {
    console.error(error)
    if (error.code === '23505') {
      return res.status(409).json({ error: 'Ya existe un usuario con ese email' })
    }
    res.status(500).json({ error: error.message })
  }
})

router.put('/:id', requireWriteAccess, async (req, res) => {
  try {
    const b = req.body
    let passwordHash = null
    if (b.password) {
      passwordHash = await bcrypt.hash(b.password, 10)
    }

    const { rows } = await query(
      `UPDATE perfiles_usuarios SET
        email = COALESCE($1, email),
        password_hash = COALESCE($2, password_hash),
        nombre = COALESCE($3, nombre),
        apellido = COALESCE($4, apellido),
        telefono = COALESCE($5, telefono),
        departamento = COALESCE($6, departamento),
        cargo = COALESCE($7, cargo),
        rol = COALESCE($8, rol),
        estado = COALESCE($9, estado),
        fecha_ingreso = COALESCE($10, fecha_ingreso),
        permisos = COALESCE($11, permisos),
        avatar_url = COALESCE($12, avatar_url)
      WHERE id = $13
      RETURNING id, email, nombre, apellido, telefono, departamento, cargo, rol,
                estado, fecha_ingreso, ultimo_acceso, permisos, avatar_url,
                created_at, updated_at`,
      [
        b.email ? String(b.email).toLowerCase().trim() : null,
        passwordHash,
        b.nombre,
        b.apellido,
        b.telefono,
        b.departamento,
        b.cargo,
        b.rol,
        b.estado,
        b.fecha_ingreso || b.fechaIngreso || null,
        b.permisos !== undefined ? JSON.stringify(b.permisos) : null,
        b.avatar_url || b.avatarUrl || null,
        req.params.id,
      ]
    )
    if (!rows[0]) return res.status(404).json({ error: 'No encontrado' })
    res.json({ data: mapUser(rows[0]) })
  } catch (error) {
    console.error(error)
    if (error.code === '23505') {
      return res.status(409).json({ error: 'Ya existe un usuario con ese email' })
    }
    res.status(500).json({ error: error.message })
  }
})

router.delete('/:id', requireWriteAccess, async (req, res) => {
  try {
    if (req.params.id === req.user.id) {
      return res.status(400).json({ error: 'No podés eliminar tu propio usuario' })
    }
    const result = await query(`DELETE FROM perfiles_usuarios WHERE id = $1`, [
      req.params.id,
    ])
    if (result.rowCount === 0) return res.status(404).json({ error: 'No encontrado' })
    res.json({ data: true })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: error.message })
  }
})

export default router
