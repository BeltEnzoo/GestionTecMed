import { Router } from 'express'
import { query } from '../db.js'
import { requireRole, isSuperuser } from '../middleware/auth.js'

const router = Router()

router.get('/', async (req, res) => {
  try {
    if (isSuperuser(req.user)) {
      const { rows } = await query(
        `SELECT id, nombre, codigo, ciudad, activa, created_at
         FROM sedes
         ORDER BY nombre`
      )
      return res.json({ data: rows })
    }

    if (!req.user.sede_id) {
      return res.json({ data: [] })
    }

    const { rows } = await query(
      `SELECT id, nombre, codigo, ciudad, activa, created_at
       FROM sedes WHERE id = $1`,
      [req.user.sede_id]
    )
    res.json({ data: rows })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: error.message })
  }
})

router.post('/', requireRole('Superusuario'), async (req, res) => {
  try {
    const { nombre, codigo, ciudad } = req.body
    if (!nombre?.trim()) {
      return res.status(400).json({ error: 'Nombre de sede requerido' })
    }
    const { rows } = await query(
      `INSERT INTO sedes (nombre, codigo, ciudad)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [
        nombre.trim(),
        codigo?.trim()?.toLowerCase() || null,
        ciudad?.trim() || null,
      ]
    )
    res.status(201).json({ data: rows[0] })
  } catch (error) {
    console.error(error)
    if (error.code === '23505') {
      return res.status(409).json({ error: 'Ya existe una sede con ese nombre o código' })
    }
    res.status(500).json({ error: error.message })
  }
})

router.put('/:id', requireRole('Superusuario'), async (req, res) => {
  try {
    const { nombre, codigo, ciudad, activa } = req.body
    const { rows } = await query(
      `UPDATE sedes SET
        nombre = COALESCE($1, nombre),
        codigo = COALESCE($2, codigo),
        ciudad = COALESCE($3, ciudad),
        activa = COALESCE($4, activa)
       WHERE id = $5
       RETURNING *`,
      [
        nombre?.trim() || null,
        codigo?.trim()?.toLowerCase() || null,
        ciudad?.trim() || null,
        typeof activa === 'boolean' ? activa : null,
        req.params.id,
      ]
    )
    if (!rows[0]) return res.status(404).json({ error: 'Sede no encontrada' })
    res.json({ data: rows[0] })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: error.message })
  }
})

export default router
