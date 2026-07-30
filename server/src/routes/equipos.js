import { Router } from 'express'
import { query } from '../db.js'
import { requireWriteAccess } from '../middleware/auth.js'

const router = Router()

function uniqueViolationMessage(error) {
  if (error.code !== '23505') return null
  const match = error.detail?.match(/Key \(([^)]+)\)=\(([^)]+)\) already exists/)
  if (match) {
    const nombres = {
      codigo_interno: 'Código Interno',
      numero_serie: 'Número de Serie',
    }
    return `Ya existe un equipo con ${nombres[match[1]] || match[1]} "${match[2]}".`
  }
  return 'Ya existe un equipo con este valor.'
}

router.get('/', async (_req, res) => {
  try {
    const { rows } = await query(
      `SELECT * FROM equipos ORDER BY created_at DESC`
    )
    res.json({ data: rows })
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
        COUNT(*) FILTER (WHERE LOWER(estado) = 'activo')::int AS activos,
        COUNT(*) FILTER (WHERE LOWER(estado) = 'mantenimiento')::int AS mantenimiento,
        COUNT(*) FILTER (WHERE LOWER(estado) IN ('fuera-servicio', 'fuera_de_servicio'))::int AS "fueraServicio"
      FROM equipos
    `)
    res.json({ data: rows[0] })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: error.message })
  }
})

router.get('/search', async (req, res) => {
  try {
    const term = `%${req.query.q || ''}%`
    const { rows } = await query(
      `SELECT * FROM equipos
       WHERE nombre ILIKE $1 OR marca ILIKE $1 OR modelo ILIKE $1
          OR numero_serie ILIKE $1 OR codigo_interno ILIKE $1 OR sala ILIKE $1
       ORDER BY created_at DESC`,
      [term]
    )
    res.json({ data: rows })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: error.message })
  }
})

router.get('/:id', async (req, res) => {
  try {
    const { rows } = await query(`SELECT * FROM equipos WHERE id = $1`, [req.params.id])
    if (!rows[0]) return res.status(404).json({ error: 'Equipo no encontrado' })

    const eventos = await query(
      `SELECT * FROM historial_eventos WHERE equipo_id = $1 ORDER BY fecha_evento DESC`,
      [req.params.id]
    )
    const mantenimientos = await query(
      `SELECT * FROM mantenimientos WHERE equipo_id = $1 ORDER BY fecha_programada DESC`,
      [req.params.id]
    )

    res.json({
      data: {
        ...rows[0],
        eventos: eventos.rows,
        mantenimientos: mantenimientos.rows,
      },
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: error.message })
  }
})

router.post('/', requireWriteAccess, async (req, res) => {
  try {
    const b = req.body
    const { rows } = await query(
      `INSERT INTO equipos (
        nombre, marca, modelo, numero_serie, codigo_interno, categoria, estado,
        año_fabricacion, potencia, voltaje, dimensiones, peso, certificaciones,
        fecha_vencimiento_garantia, edificio, piso, sala, cama, responsable,
        departamento, frecuencia_mantenimiento, proveedor_mantenimiento,
        costo_promedio_mantenimiento, costo_adquisicion, valor_actual, notas,
        archivos, created_by
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,
        $20,$21,$22,$23,$24,$25,$26,$27,$28
      ) RETURNING *`,
      [
        b.nombre ?? null,
        b.marca ?? null,
        b.modelo ?? null,
        b.numero_serie ?? null,
        b.codigo_interno ?? null,
        b.categoria ?? null,
        b.estado || 'activo',
        b.año_fabricacion ?? null,
        b.potencia ?? null,
        b.voltaje ?? null,
        b.dimensiones ?? null,
        b.peso ?? null,
        b.certificaciones ?? null,
        b.fecha_vencimiento_garantia || null,
        b.edificio ?? null,
        b.piso ?? null,
        b.sala ?? null,
        b.cama ?? null,
        b.responsable ?? null,
        b.departamento ?? null,
        b.frecuencia_mantenimiento ?? null,
        b.proveedor_mantenimiento ?? null,
        b.costo_promedio_mantenimiento ?? null,
        b.costo_adquisicion ?? null,
        b.valor_actual ?? null,
        b.notas ?? null,
        JSON.stringify(b.archivos || []),
        b.created_by || req.user?.id || null,
      ]
    )
    res.status(201).json({ data: rows[0] })
  } catch (error) {
    console.error(error)
    const msg = uniqueViolationMessage(error)
    res.status(msg ? 409 : 500).json({ error: msg || error.message, code: error.code, details: error.detail })
  }
})

router.put('/:id', requireWriteAccess, async (req, res) => {
  try {
    const b = req.body
    const fields = []
    const values = []
    const set = (col, val, cast) => {
      if (val === undefined) return
      values.push(val)
      fields.push(`${col} = $${values.length}${cast || ''}`)
    }

    set('nombre', b.nombre)
    set('marca', b.marca)
    set('modelo', b.modelo)
    set('numero_serie', b.numero_serie)
    set('codigo_interno', b.codigo_interno)
    set('categoria', b.categoria)
    set('estado', b.estado)
    set('año_fabricacion', b.año_fabricacion)
    set('potencia', b.potencia)
    set('voltaje', b.voltaje)
    set('dimensiones', b.dimensiones)
    set('peso', b.peso)
    set('certificaciones', b.certificaciones)
    set('fecha_vencimiento_garantia', b.fecha_vencimiento_garantia)
    set('edificio', b.edificio)
    set('piso', b.piso)
    set('sala', b.sala)
    set('cama', b.cama)
    set('responsable', b.responsable)
    set('departamento', b.departamento)
    set('frecuencia_mantenimiento', b.frecuencia_mantenimiento)
    set('proveedor_mantenimiento', b.proveedor_mantenimiento)
    set('costo_promedio_mantenimiento', b.costo_promedio_mantenimiento)
    set('costo_adquisicion', b.costo_adquisicion)
    set('valor_actual', b.valor_actual)
    set('notas', b.notas)
    if (b.archivos !== undefined) {
      set('archivos', JSON.stringify(b.archivos), '::jsonb')
    }

    if (!fields.length) {
      return res.status(400).json({ error: 'Nada para actualizar' })
    }

    values.push(req.params.id)
    const { rows } = await query(
      `UPDATE equipos SET ${fields.join(', ')} WHERE id = $${values.length} RETURNING *`,
      values
    )
    if (!rows[0]) return res.status(404).json({ error: 'Equipo no encontrado' })
    res.json({ data: rows[0] })
  } catch (error) {
    console.error(error)
    const msg = uniqueViolationMessage(error)
    res.status(msg ? 409 : 500).json({ error: msg || error.message, code: error.code, details: error.detail })
  }
})
router.delete('/:id', requireWriteAccess, async (req, res) => {
  try {
    const result = await query(`DELETE FROM equipos WHERE id = $1`, [req.params.id])
    if (result.rowCount === 0) return res.status(404).json({ error: 'Equipo no encontrado' })
    res.json({ data: true })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: error.message })
  }
})

export default router
