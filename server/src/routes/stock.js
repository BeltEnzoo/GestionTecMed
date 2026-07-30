import { Router } from 'express'
import { query } from '../db.js'
import { requireWriteAccess } from '../middleware/auth.js'

const router = Router()

router.get('/', async (_req, res) => {
  try {
    const { rows } = await query(
      `SELECT * FROM stock_insumos ORDER BY nombre ASC`
    )
    res.json({ data: rows })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: error.message })
  }
})

router.get('/search', async (req, res) => {
  try {
    const term = `%${req.query.q || ''}%`
    const { rows } = await query(
      `SELECT * FROM stock_insumos
       WHERE nombre ILIKE $1 OR categoria ILIKE $1 OR ubicacion ILIKE $1 OR proveedor ILIKE $1
       ORDER BY nombre ASC`,
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
    const { rows } = await query(`SELECT * FROM stock_insumos WHERE id = $1`, [
      req.params.id,
    ])
    if (!rows[0]) return res.status(404).json({ error: 'No encontrado' })
    res.json({ data: rows[0] })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: error.message })
  }
})

router.post('/', requireWriteAccess, async (req, res) => {
  try {
    const b = req.body
    const { rows } = await query(
      `INSERT INTO stock_insumos (
        nombre, descripcion, categoria, cantidad, unidad_medida, stock_minimo,
        ubicacion, proveedor, costo_unitario, fecha_ingreso, fecha_vencimiento,
        notas, created_by
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING *`,
      [
        b.nombre || '',
        b.descripcion ?? null,
        b.categoria || 'Insumo',
        b.cantidad ?? 0,
        b.unidad_medida || 'unidades',
        b.stock_minimo ?? 0,
        b.ubicacion ?? null,
        b.proveedor ?? null,
        b.costo_unitario ?? null,
        b.fecha_ingreso || new Date().toISOString().split('T')[0],
        b.fecha_vencimiento || null,
        b.notas ?? null,
        b.created_by || req.user?.id || null,
      ]
    )
    res.status(201).json({ data: rows[0] })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: error.message })
  }
})

router.put('/:id', requireWriteAccess, async (req, res) => {
  try {
    const b = req.body
    const { rows } = await query(
      `UPDATE stock_insumos SET
        nombre = COALESCE($1, nombre),
        descripcion = COALESCE($2, descripcion),
        categoria = COALESCE($3, categoria),
        cantidad = COALESCE($4, cantidad),
        unidad_medida = COALESCE($5, unidad_medida),
        stock_minimo = COALESCE($6, stock_minimo),
        ubicacion = COALESCE($7, ubicacion),
        proveedor = COALESCE($8, proveedor),
        costo_unitario = COALESCE($9, costo_unitario),
        fecha_ingreso = COALESCE($10, fecha_ingreso),
        fecha_vencimiento = COALESCE($11, fecha_vencimiento),
        notas = COALESCE($12, notas)
      WHERE id = $13
      RETURNING *`,
      [
        b.nombre,
        b.descripcion,
        b.categoria,
        b.cantidad,
        b.unidad_medida,
        b.stock_minimo,
        b.ubicacion,
        b.proveedor,
        b.costo_unitario,
        b.fecha_ingreso,
        b.fecha_vencimiento,
        b.notas,
        req.params.id,
      ]
    )
    if (!rows[0]) return res.status(404).json({ error: 'No encontrado' })
    res.json({ data: rows[0] })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: error.message })
  }
})

router.delete('/:id', requireWriteAccess, async (req, res) => {
  try {
    const result = await query(`DELETE FROM stock_insumos WHERE id = $1`, [
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
