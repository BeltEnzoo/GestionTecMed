import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { query } from '../db.js'
import {
  requireRole,
  requireWriteAccess,
  isSuperuser,
} from '../middleware/auth.js'

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
    sede_id: row.sede_id || null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

router.use(requireRole('Superusuario', 'Administrador'))

router.get('/', async (req, res) => {
  try {
    let rows
    if (isSuperuser(req.user)) {
      // En sede activa: usuarios de esa sede + superusuarios globales
      const result = await query(
        `SELECT id, email, nombre, apellido, telefono, departamento, cargo, rol,
                estado, fecha_ingreso, ultimo_acceso, permisos, avatar_url, sede_id,
                created_at, updated_at
         FROM perfiles_usuarios
         WHERE sede_id = $1 OR rol = 'Superusuario'
         ORDER BY created_at DESC`,
        [req.sedeId]
      )
      rows = result.rows
    } else {
      const result = await query(
        `SELECT id, email, nombre, apellido, telefono, departamento, cargo, rol,
                estado, fecha_ingreso, ultimo_acceso, permisos, avatar_url, sede_id,
                created_at, updated_at
         FROM perfiles_usuarios
         WHERE sede_id = $1 AND rol <> 'Superusuario'
         ORDER BY created_at DESC`,
        [req.sedeId]
      )
      rows = result.rows
    }
    res.json({ data: rows.map(mapUser) })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: error.message })
  }
})

router.get('/stats', async (req, res) => {
  try {
    const { rows } = await query(
      `
      SELECT
        COUNT(*) FILTER (WHERE sede_id = $1 OR (rol = 'Superusuario' AND $2))::int AS total,
        COUNT(*) FILTER (WHERE estado = 'Activo' AND (sede_id = $1 OR rol = 'Superusuario'))::int AS activos,
        COUNT(*) FILTER (WHERE rol = 'Administrador' AND sede_id = $1)::int AS administradores,
        COUNT(*) FILTER (WHERE rol = 'Técnico' AND sede_id = $1)::int AS tecnicos,
        COUNT(*) FILTER (WHERE rol = 'Invitado' AND sede_id = $1)::int AS invitados,
        COUNT(*) FILTER (WHERE rol = 'Superusuario')::int AS superusuarios
      FROM perfiles_usuarios
    `,
      [req.sedeId, isSuperuser(req.user)]
    )
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
              estado, fecha_ingreso, ultimo_acceso, permisos, avatar_url, sede_id,
              created_at, updated_at
       FROM perfiles_usuarios WHERE id = $1`,
      [req.params.id]
    )
    if (!rows[0]) return res.status(404).json({ error: 'No encontrado' })
    if (
      !isSuperuser(req.user) &&
      rows[0].sede_id !== req.sedeId &&
      rows[0].rol !== 'Superusuario'
    ) {
      return res.status(404).json({ error: 'No encontrado' })
    }
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

    let rol = b.rol || 'Invitado'
    let sedeId = b.sede_id || req.sedeId

    if (!isSuperuser(req.user)) {
      if (rol === 'Superusuario') {
        return res.status(403).json({ error: 'No podés crear superusuarios' })
      }
      sedeId = req.sedeId
    } else if (rol === 'Superusuario') {
      sedeId = null
    } else if (!sedeId) {
      return res.status(400).json({ error: 'La sede es requerida' })
    }

    const hash = await bcrypt.hash(b.password, 10)
    const { rows } = await query(
      `INSERT INTO perfiles_usuarios (
        email, password_hash, nombre, apellido, telefono, departamento, cargo,
        rol, estado, fecha_ingreso, permisos, avatar_url, created_by, sede_id
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
      RETURNING id, email, nombre, apellido, telefono, departamento, cargo, rol,
                estado, fecha_ingreso, ultimo_acceso, permisos, avatar_url, sede_id,
                created_at, updated_at`,
      [
        String(b.email).toLowerCase().trim(),
        hash,
        b.nombre,
        b.apellido,
        b.telefono ?? null,
        b.departamento ?? null,
        b.cargo ?? null,
        rol,
        b.estado || 'Activo',
        b.fecha_ingreso || b.fechaIngreso || new Date().toISOString().split('T')[0],
        JSON.stringify(b.permisos || {}),
        b.avatar_url || b.avatarUrl || null,
        req.user?.id || null,
        sedeId,
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
    const existing = await query(`SELECT * FROM perfiles_usuarios WHERE id = $1`, [
      req.params.id,
    ])
    if (!existing.rows[0]) return res.status(404).json({ error: 'No encontrado' })

    if (
      !isSuperuser(req.user) &&
      existing.rows[0].sede_id !== req.sedeId
    ) {
      return res.status(403).json({ error: 'Sin permisos sobre este usuario' })
    }

    let rol = b.rol
    let sedeId = b.sede_id
    if (!isSuperuser(req.user)) {
      if (rol === 'Superusuario') {
        return res.status(403).json({ error: 'No podés asignar Superusuario' })
      }
      sedeId = req.sedeId
    } else if (rol === 'Superusuario') {
      sedeId = null
    }

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
        avatar_url = COALESCE($12, avatar_url),
        sede_id = COALESCE($13, sede_id)
      WHERE id = $14
      RETURNING id, email, nombre, apellido, telefono, departamento, cargo, rol,
                estado, fecha_ingreso, ultimo_acceso, permisos, avatar_url, sede_id,
                created_at, updated_at`,
      [
        b.email ? String(b.email).toLowerCase().trim() : null,
        passwordHash,
        b.nombre,
        b.apellido,
        b.telefono,
        b.departamento,
        b.cargo,
        rol,
        b.estado,
        b.fecha_ingreso || b.fechaIngreso || null,
        b.permisos !== undefined ? JSON.stringify(b.permisos) : null,
        b.avatar_url || b.avatarUrl || null,
        sedeId === undefined ? null : sedeId,
        req.params.id,
      ]
    )
    // Fix: COALESCE won't set null sede for Superusuario when sedeId is null intentionally
    if (isSuperuser(req.user) && rol === 'Superusuario') {
      await query(`UPDATE perfiles_usuarios SET sede_id = NULL WHERE id = $1`, [
        req.params.id,
      ])
    }

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
    const existing = await query(`SELECT * FROM perfiles_usuarios WHERE id = $1`, [
      req.params.id,
    ])
    if (!existing.rows[0]) return res.status(404).json({ error: 'No encontrado' })
    if (
      !isSuperuser(req.user) &&
      existing.rows[0].sede_id !== req.sedeId
    ) {
      return res.status(403).json({ error: 'Sin permisos' })
    }
    await query(`DELETE FROM perfiles_usuarios WHERE id = $1`, [req.params.id])
    res.json({ data: true })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: error.message })
  }
})

export default router
