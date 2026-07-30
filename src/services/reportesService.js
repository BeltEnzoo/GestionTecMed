import { api } from './api'

export const reportesService = {
  async getEstadisticasGenerales() {
    try {
      return await api('/api/reportes/generales')
    } catch (error) {
      console.error('Error al obtener estadísticas generales:', error)
      return {
        totalEquipos: 0,
        equiposActivos: 0,
        equiposFueraServicio: 0,
        equiposMantenimiento: 0,
        distribucionTipo: {},
        distribucionUbicacion: {},
        mantenimientosPendientes: 0,
        proximosMantenimientos: 0,
      }
    }
  },

  async getReporteMantenimientos(fechaInicio, fechaFin) {
    try {
      const params = new URLSearchParams()
      if (fechaInicio) params.set('fechaInicio', fechaInicio)
      if (fechaFin) params.set('fechaFin', fechaFin)
      const result = await api(`/api/reportes/mantenimientos?${params}`)
      const data = result.data || []

      const mantenimientosPorTipo = data.reduce((acc, m) => {
        const tipo = m.tipo || 'Sin especificar'
        acc[tipo] = (acc[tipo] || 0) + 1
        return acc
      }, {})

      return {
        totalMantenimientos: result.totalMantenimientos || 0,
        mantenimientosCompletados: result.mantenimientosCompletados || 0,
        mantenimientosPendientes: result.mantenimientosPendientes || 0,
        costoTotal: result.costoTotal || 0,
        mantenimientosPorTipo,
        detalles: data,
      }
    } catch (error) {
      console.error('Error al obtener reporte de mantenimientos:', error)
      return {
        totalMantenimientos: 0,
        mantenimientosCompletados: 0,
        mantenimientosPendientes: 0,
        costoTotal: 0,
        mantenimientosPorTipo: {},
        detalles: [],
      }
    }
  },

  async getEquiposRequierenAtencion() {
    try {
      const { data: equipos } = await api('/api/equipos')
      const { data: mantenimientos } = await api('/api/mantenimientos')
      const now = new Date()

      const equiposFueraServicio = (equipos || []).filter((e) => {
        const s = (e.estado || '').toLowerCase()
        return s === 'fuera-servicio' || s === 'fuera de servicio'
      })

      const mantenimientosVencidos = (mantenimientos || []).filter((m) => {
        const e = (m.estado || '').toLowerCase()
        return (
          (e === 'programado' || e === 'pendiente') &&
          m.fecha_programada &&
          new Date(m.fecha_programada) < now
        )
      })

      const equiposSinMantenimientoReciente = (equipos || []).filter((e) => {
        const s = (e.estado || '').toLowerCase()
        return s === 'activo'
      })

      return {
        equiposFueraServicio,
        mantenimientosVencidos,
        equiposSinMantenimientoReciente,
      }
    } catch (error) {
      console.error('Error al obtener equipos que requieren atención:', error)
      return {
        equiposFueraServicio: [],
        mantenimientosVencidos: [],
        equiposSinMantenimientoReciente: [],
      }
    }
  },

  async getAllEquipos() {
    try {
      const { data } = await api('/api/equipos')
      return (data || []).sort((a, b) =>
        (a.marca || '').localeCompare(b.marca || '')
      )
    } catch (error) {
      console.error('Error al obtener todos los equipos:', error)
      return []
    }
  },

  async getTendenciasMantenimiento(meses = 12) {
    try {
      const fechaInicio = new Date()
      fechaInicio.setMonth(fechaInicio.getMonth() - meses)
      const result = await api(
        `/api/reportes/mantenimientos?fechaInicio=${fechaInicio.toISOString().split('T')[0]}`
      )
      const data = result.data || []

      const tendencias = data.reduce((acc, mantenimiento) => {
        if (!mantenimiento.fecha_completado) return acc
        const fecha = new Date(mantenimiento.fecha_completado)
        const mes = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`

        if (!acc[mes]) {
          acc[mes] = { mes, total: 0, completados: 0, costo: 0 }
        }

        acc[mes].total += 1
        if ((mantenimiento.estado || '').toLowerCase() === 'completado') {
          acc[mes].completados += 1
        }
        acc[mes].costo += Number(mantenimiento.costo) || 0
        return acc
      }, {})

      return Object.values(tendencias).sort((a, b) => a.mes.localeCompare(b.mes))
    } catch (error) {
      console.error('Error al obtener tendencias de mantenimiento:', error)
      throw error
    }
  },
}
