import { Router } from 'express'
import { query } from '../db.js'
import { requireWriteAccess } from '../middleware/auth.js'

const router = Router()

const NORMALIZE_ESTADO = {
  Programado: 'programado',
  programado: 'programado',
  'En Proceso': 'en_proceso',
  en_proceso: 'en_proceso',
  Completado: 'completado',
  completado: 'completado',
  Cancelado: 'cancelado',
  cancelado: 'cancelado',
  Pendiente: 'programado',
}

function normalizeEstado(estado) {
  if (!estado) return 'programado'
  return NORMALIZE_ESTADO[estado] || String(estado).toLowerCase().replace(/\s+/g, '_')
}

async function attachEquipos(rows) {
  if (!rows.length) return rows
  const ids = [...new Set(rows.map((r) => r.equipo_id).filter(Boolean))]
  if (!ids.length) return rows.map((r) => ({ ...r, equipos: null }))
  const { rows: equipos } = await query(
    `SELECT id, nombre, marca, modelo FROM equipos WHERE id = ANY($1::uuid[])`,
    [ids]
  )
  const map = Object.fromEntries(equipos.map((e) => [e.id, e]))
  return rows.map((r) => ({ ...r, equipos: map[r.equipo_id] || null }))
}

async function resolveEquipoInSede(equipoRef, sedeId) {
  if (!equipoRef) return null
  const { rows } = await query(
    `SELECT id FROM equipos
     WHERE sede_id = $1 AND (id::text = $2 OR nombre = $2)
     LIMIT 1`,
    [sedeId, String(equipoRef)]
  )
  return rows[0]?.id || null
}

router.get('/', async (req, res) => {
  try {
    const { rows } = await query(
      `SELECT m.* FROM mantenimientos m
       INNER JOIN equipos e ON e.id = m.equipo_id
       WHERE e.sede_id = $1
       ORDER BY m.created_at DESC`,
      [req.sedeId]
    )
    res.json({ data: await attachEquipos(rows) })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: error.message })
  }
})

router.get('/:id', async (req, res) => {
  try {
    const { rows } = await query(
      `SELECT m.* FROM mantenimientos m
       INNER JOIN equipos e ON e.id = m.equipo_id
       WHERE m.id = $1 AND e.sede_id = $2`,
      [req.params.id, req.sedeId]
    )
    if (!rows[0]) return res.status(404).json({ error: 'No encontrado' })
    const [item] = await attachEquipos(rows)
    res.json({ data: item })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: error.message })
  }
})

router.post('/', requireWriteAccess, async (req, res) => {
  try {
    const b = req.body
    const equipoId = await resolveEquipoInSede(b.equipo_id || b.equipo, req.sedeId)
    if (!equipoId) {
      return res.status(400).json({ error: 'Equipo inválido para esta sede' })
    }

    const estado = normalizeEstado(b.estado)
    let fechaCompletado = b.fecha_completado || null
    if (estado === 'completado' && !fechaCompletado) {
      fechaCompletado = new Date().toISOString().split('T')[0]
    }

    const { rows } = await query(
      `INSERT INTO mantenimientos (
        equipo_id, tipo, tecnico, fecha_programada, fecha_completado,
        estado, costo, descripcion, observaciones
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [
        equipoId,
        b.tipo,
        b.tecnico,
        b.fecha_programada,
        fechaCompletado,
        estado,
        b.costo ?? null,
        b.descripcion ?? null,
        b.observaciones ?? null,
      ]
    )
    const [item] = await attachEquipos(rows)
    res.status(201).json({ data: item })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: error.message })
  }
})

router.put('/:id', requireWriteAccess, async (req, res) => {
  try {
    const b = req.body
    let equipoId
    if (b.equipo_id !== undefined || b.equipo !== undefined) {
      equipoId = await resolveEquipoInSede(b.equipo_id || b.equipo, req.sedeId)
      if (!equipoId) {
        return res.status(400).json({ error: 'Equipo inválido para esta sede' })
      }
    }

    const ownership = await query(
      `SELECT m.id FROM mantenimientos m
       INNER JOIN equipos e ON e.id = m.equipo_id
       WHERE m.id = $1 AND e.sede_id = $2`,
      [req.params.id, req.sedeId]
    )
    if (!ownership.rows[0]) return res.status(404).json({ error: 'No encontrado' })

    const estado = b.estado !== undefined ? normalizeEstado(b.estado) : undefined
    let fechaCompletado = b.fecha_completado
    if (estado === 'completado' && !fechaCompletado) {
      fechaCompletado = new Date().toISOString().split('T')[0]
    }

    const { rows } = await query(
      `UPDATE mantenimientos SET
        equipo_id = COALESCE($1, equipo_id),
        tipo = COALESCE($2, tipo),
        tecnico = COALESCE($3, tecnico),
        fecha_programada = COALESCE($4, fecha_programada),
        fecha_completado = COALESCE($5, fecha_completado),
        estado = COALESCE($6, estado),
        costo = COALESCE($7, costo),
        descripcion = COALESCE($8, descripcion),
        observaciones = COALESCE($9, observaciones)
      WHERE id = $10
      RETURNING *`,
      [
        equipoId ?? null,
        b.tipo,
        b.tecnico,
        b.fecha_programada,
        fechaCompletado,
        estado,
        b.costo,
        b.descripcion,
        b.observaciones,
        req.params.id,
      ]
    )
    const [item] = await attachEquipos(rows)
    res.json({ data: item })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: error.message })
  }
})

router.delete('/:id', requireWriteAccess, async (req, res) => {
  try {
    const result = await query(
      `DELETE FROM mantenimientos m
       USING equipos e
       WHERE m.equipo_id = e.id AND m.id = $1 AND e.sede_id = $2`,
      [req.params.id, req.sedeId]
    )
    if (result.rowCount === 0) return res.status(404).json({ error: 'No encontrado' })
    res.json({ data: true })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: error.message })
  }
})

export default router
