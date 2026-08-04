import { Router } from 'express'
import { query } from '../db.js'
import { requireWriteAccess } from '../middleware/auth.js'

const router = Router()

async function attachEquipos(rows) {
  if (!rows.length) return rows
  const ids = [...new Set(rows.map((r) => r.equipo_id).filter(Boolean))]
  if (!ids.length) return rows.map((r) => ({ ...r, equipos: null }))
  const { rows: equipos } = await query(
    `SELECT * FROM equipos WHERE id = ANY($1::uuid[])`,
    [ids]
  )
  const map = Object.fromEntries(equipos.map((e) => [e.id, e]))
  return rows.map((r) => ({ ...r, equipos: map[r.equipo_id] || null }))
}

router.get('/', async (req, res) => {
  try {
    const { rows } = await query(
      `SELECT h.* FROM historial_eventos h
       INNER JOIN equipos e ON e.id = h.equipo_id
       WHERE e.sede_id = $1
       ORDER BY h.fecha_evento DESC`,
      [req.sedeId]
    )
    res.json({ data: await attachEquipos(rows) })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: error.message })
  }
})

router.get('/equipo/:equipoId', async (req, res) => {
  try {
    const { rows } = await query(
      `SELECT h.* FROM historial_eventos h
       INNER JOIN equipos e ON e.id = h.equipo_id
       WHERE h.equipo_id = $1 AND e.sede_id = $2
       ORDER BY h.fecha_evento DESC`,
      [req.params.equipoId, req.sedeId]
    )
    res.json({ data: await attachEquipos(rows) })
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
        COUNT(*)::int AS total,
        COUNT(*) FILTER (WHERE h.estado = 'Registrado')::int AS registrados,
        COUNT(*) FILTER (WHERE h.estado = 'En Proceso')::int AS en_proceso,
        COUNT(*) FILTER (WHERE h.estado = 'Resuelto')::int AS resueltos,
        COUNT(*) FILTER (WHERE h.prioridad = 'Alta')::int AS prioridad_alta
      FROM historial_eventos h
      INNER JOIN equipos e ON e.id = h.equipo_id
      WHERE e.sede_id = $1
    `,
      [req.sedeId]
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
      `SELECT h.* FROM historial_eventos h
       INNER JOIN equipos e ON e.id = h.equipo_id
       WHERE h.id = $1 AND e.sede_id = $2`,
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
    const equipoRef = b.equipo_id || b.equipo
    const owned = await query(
      `SELECT id FROM equipos WHERE sede_id = $1 AND id::text = $2 LIMIT 1`,
      [req.sedeId, String(equipoRef)]
    )
    const equipoId = owned.rows[0]?.id
    if (!equipoId) {
      return res.status(400).json({ error: 'Equipo inválido para esta sede' })
    }
    const { rows } = await query(
      `INSERT INTO historial_eventos (
        equipo_id, tipo_evento, titulo, descripcion, fecha_evento,
        prioridad, estado, tecnico_responsable, costo_reparacion,
        fecha_resolucion, observaciones_resolucion
      ) VALUES ($1,$2,$3,$4,COALESCE($5, NOW()),$6,$7,$8,$9,$10,$11)
      RETURNING *`,
      [
        equipoId,
        b.tipo_evento,
        b.titulo,
        b.descripcion ?? null,
        b.fecha_evento || null,
        b.prioridad || 'Media',
        b.estado || 'Registrado',
        b.tecnico_responsable ?? null,
        b.costo_reparacion ?? null,
        b.fecha_resolucion || null,
        b.observaciones_resolucion ?? null,
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
    const equipoId = b.equipo_id || b.equipo
    const { rows } = await query(
      `UPDATE historial_eventos SET
        equipo_id = COALESCE($1, equipo_id),
        tipo_evento = COALESCE($2, tipo_evento),
        titulo = COALESCE($3, titulo),
        descripcion = COALESCE($4, descripcion),
        fecha_evento = COALESCE($5, fecha_evento),
        prioridad = COALESCE($6, prioridad),
        estado = COALESCE($7, estado),
        tecnico_responsable = COALESCE($8, tecnico_responsable),
        costo_reparacion = COALESCE($9, costo_reparacion),
        fecha_resolucion = COALESCE($10, fecha_resolucion),
        observaciones_resolucion = COALESCE($11, observaciones_resolucion)
      WHERE id = $12
      RETURNING *`,
      [
        equipoId ?? null,
        b.tipo_evento,
        b.titulo,
        b.descripcion,
        b.fecha_evento,
        b.prioridad,
        b.estado,
        b.tecnico_responsable,
        b.costo_reparacion,
        b.fecha_resolucion,
        b.observaciones_resolucion,
        req.params.id,
      ]
    )
    if (!rows[0]) return res.status(404).json({ error: 'No encontrado' })
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
      `DELETE FROM historial_eventos h
       USING equipos e
       WHERE h.equipo_id = e.id AND h.id = $1 AND e.sede_id = $2`,
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
