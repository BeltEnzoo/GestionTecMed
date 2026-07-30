import { Router } from 'express'
import { query } from '../db.js'

const router = Router()

function normalizarEstado(estado) {
  if (!estado) return ''
  const e = estado.toLowerCase().trim()
  if (e === 'activo' || e === 'disponible') return 'activo'
  if (e === 'mantenimiento' || e === 'en mantenimiento') return 'mantenimiento'
  if (e === 'fuera-servicio' || e === 'fuera de servicio' || e === 'fuera_de_servicio') {
    return 'fuera-servicio'
  }
  return e
}

router.get('/generales', async (_req, res) => {
  try {
    const equipos = (await query(`SELECT * FROM equipos`)).rows
    const mantenimientos = (await query(`SELECT * FROM mantenimientos`)).rows

    const totalEquipos = equipos.length
    const equiposActivos = equipos.filter((e) => normalizarEstado(e.estado) === 'activo').length
    const equiposFueraServicio = equipos.filter(
      (e) => normalizarEstado(e.estado) === 'fuera-servicio'
    ).length
    const equiposMantenimiento = equipos.filter(
      (e) => normalizarEstado(e.estado) === 'mantenimiento'
    ).length

    const distribucionTipo = equipos.reduce((acc, equipo) => {
      const tipo = equipo.categoria || equipo.tipo || 'Sin especificar'
      acc[tipo] = (acc[tipo] || 0) + 1
      return acc
    }, {})

    const distribucionUbicacion = equipos.reduce((acc, equipo) => {
      const ubicacion = equipo.departamento || equipo.sala || 'Sin especificar'
      acc[ubicacion] = (acc[ubicacion] || 0) + 1
      return acc
    }, {})

    const mantenimientosPendientes = mantenimientos.filter((m) => {
      const e = (m.estado || '').toLowerCase().trim()
      return e === 'programado' || e === 'pendiente'
    }).length

    const hoy = new Date()
    hoy.setHours(0, 0, 0, 0)
    const en7Dias = new Date(hoy.getTime() + 7 * 24 * 60 * 60 * 1000)
    const proximosMantenimientos = mantenimientos.filter((m) => {
      if (!m.fecha_programada) return false
      const fecha = new Date(m.fecha_programada)
      fecha.setHours(0, 0, 0, 0)
      return fecha >= hoy && fecha <= en7Dias
    }).length

    res.json({
      totalEquipos,
      equiposActivos,
      equiposFueraServicio,
      equiposMantenimiento,
      distribucionTipo,
      distribucionUbicacion,
      mantenimientosPendientes,
      proximosMantenimientos,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      totalEquipos: 0,
      equiposActivos: 0,
      equiposFueraServicio: 0,
      equiposMantenimiento: 0,
      distribucionTipo: {},
      distribucionUbicacion: {},
      mantenimientosPendientes: 0,
      proximosMantenimientos: 0,
      error: error.message,
    })
  }
})

router.get('/dashboard', async (_req, res) => {
  try {
    const equipos = (await query(`SELECT * FROM equipos`)).rows
    const mantenimientos = (await query(`SELECT * FROM mantenimientos`)).rows
    const eventos = (
      await query(
        `SELECT e.*, eq.nombre AS equipo_nombre
         FROM historial_eventos e
         LEFT JOIN equipos eq ON eq.id = e.equipo_id
         ORDER BY e.fecha_evento DESC
         LIMIT 20`
      )
    ).rows

    const totalEquipos = equipos.length
    const equiposActivos = equipos.filter((e) => normalizarEstado(e.estado) === 'activo').length
    const mantenimientosPendientes = mantenimientos.filter((m) => {
      const e = (m.estado || '').toLowerCase().trim()
      return e === 'programado' || e === 'pendiente' || e === 'en_proceso'
    }).length

    const hoy = new Date()
    hoy.setHours(0, 0, 0, 0)
    const en7Dias = new Date(hoy.getTime() + 7 * 24 * 60 * 60 * 1000)
    const proximosMantenimientos = mantenimientos.filter((m) => {
      if (!m.fecha_programada) return false
      const fecha = new Date(m.fecha_programada)
      fecha.setHours(0, 0, 0, 0)
      return fecha >= hoy && fecha <= en7Dias
    }).length

    res.json({
      data: {
        equipos,
        mantenimientos,
        eventos,
        stats: {
          totalEquipos,
          equiposActivos,
          mantenimientosPendientes,
          proximosMantenimientos,
        },
      },
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: error.message })
  }
})

router.get('/mantenimientos', async (req, res) => {
  try {
    const { fechaInicio, fechaFin } = req.query
    let sql = `SELECT * FROM mantenimientos WHERE 1=1`
    const params = []
    if (fechaInicio) {
      params.push(fechaInicio)
      sql += ` AND fecha_completado >= $${params.length}`
    }
    if (fechaFin) {
      params.push(fechaFin)
      sql += ` AND fecha_completado <= $${params.length}`
    }
    const { rows: data } = await query(sql, params)

    const totalMantenimientos = data.length
    const mantenimientosCompletados = data.filter(
      (m) => (m.estado || '').toLowerCase() === 'completado'
    ).length
    const mantenimientosPendientes = data.filter((m) =>
      ['programado', 'pendiente', 'en_proceso'].includes((m.estado || '').toLowerCase())
    ).length
    const costoTotal = data.reduce((sum, m) => sum + (Number(m.costo) || 0), 0)

    res.json({
      data,
      totalMantenimientos,
      mantenimientosCompletados,
      mantenimientosPendientes,
      costoTotal,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: error.message })
  }
})

export default router
