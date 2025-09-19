import { supabase } from './supabase'

export const reportesService = {
  // Obtener estadísticas generales
  async getEstadisticasGenerales() {
    try {
      const { data: equipos, error: equiposError } = await supabase
        .from('equipos')
        .select('*')

      if (equiposError) {
        console.error('Error al obtener equipos:', equiposError)
        throw equiposError
      }

      const { data: mantenimientos, error: mantenimientosError } = await supabase
        .from('mantenimientos')
        .select('*')

      if (mantenimientosError) {
        console.error('Error al obtener mantenimientos:', mantenimientosError)
        throw mantenimientosError
      }

      // Calcular estadísticas con datos seguros
      const equiposData = equipos || []
      const mantenimientosData = mantenimientos || []

      const totalEquipos = equiposData.length
      const equiposActivos = equiposData.filter(e => e.estado === 'Activo').length
      const equiposFueraServicio = equiposData.filter(e => e.estado === 'Fuera de Servicio').length
      const equiposMantenimiento = equiposData.filter(e => e.estado === 'En Mantenimiento').length

      // Distribución por tipo
      const distribucionTipo = equiposData.reduce((acc, equipo) => {
        const tipo = equipo.tipo || 'Sin especificar'
        acc[tipo] = (acc[tipo] || 0) + 1
        return acc
      }, {})

      // Distribución por ubicación
      const distribucionUbicacion = equiposData.reduce((acc, equipo) => {
        const ubicacion = equipo.ubicacion || 'Sin especificar'
        acc[ubicacion] = (acc[ubicacion] || 0) + 1
        return acc
      }, {})

      // Mantenimientos pendientes
      const mantenimientosPendientes = mantenimientosData.filter(m => m.estado === 'Pendiente').length

      // Próximos mantenimientos (en los próximos 30 días)
      const hoy = new Date()
      const en30Dias = new Date(hoy.getTime() + 30 * 24 * 60 * 60 * 1000)
      const proximosMantenimientos = mantenimientosData.filter(m => {
        if (!m.fecha_programada) return false
        const fecha = new Date(m.fecha_programada)
        return fecha >= hoy && fecha <= en30Dias
      }).length

      return {
        totalEquipos,
        equiposActivos,
        equiposFueraServicio,
        equiposMantenimiento,
        distribucionTipo,
        distribucionUbicacion,
        mantenimientosPendientes,
        proximosMantenimientos
      }
    } catch (error) {
      console.error('Error al obtener estadísticas generales:', error)
      // Devolver estadísticas por defecto en caso de error
      return {
        totalEquipos: 0,
        equiposActivos: 0,
        equiposFueraServicio: 0,
        equiposMantenimiento: 0,
        distribucionTipo: {},
        distribucionUbicacion: {},
        mantenimientosPendientes: 0,
        proximosMantenimientos: 0
      }
    }
  },

  // Obtener reporte de mantenimientos por período
  async getReporteMantenimientos(fechaInicio, fechaFin) {
    try {
      const { data, error } = await supabase
        .from('mantenimientos')
        .select('*')
        .gte('fecha_completado', fechaInicio)
        .lte('fecha_completado', fechaFin)

      if (error) throw error

      // Calcular estadísticas del período
      const totalMantenimientos = data?.length || 0
      const mantenimientosCompletados = data?.filter(m => m.estado === 'Completado').length || 0
      const mantenimientosPendientes = data?.filter(m => m.estado === 'Pendiente').length || 0

      // Costo total
      const costoTotal = data?.reduce((sum, m) => sum + (m.costo || 0), 0) || 0

      // Mantenimientos por tipo
      const mantenimientosPorTipo = data?.reduce((acc, m) => {
        const tipo = m.tipo || 'Sin especificar'
        acc[tipo] = (acc[tipo] || 0) + 1
        return acc
      }, {}) || {}

      return {
        totalMantenimientos,
        mantenimientosCompletados,
        mantenimientosPendientes,
        costoTotal,
        mantenimientosPorTipo,
        detalles: data || []
      }
    } catch (error) {
      console.error('Error al obtener reporte de mantenimientos:', error)
      // Devolver datos vacíos en caso de error
      return {
        totalMantenimientos: 0,
        mantenimientosCompletados: 0,
        mantenimientosPendientes: 0,
        costoTotal: 0,
        mantenimientosPorTipo: {},
        detalles: []
      }
    }
  },

  // Obtener equipos que requieren atención
  async getEquiposRequierenAtencion() {
    try {
      // Equipos fuera de servicio
      const { data: equiposFueraServicio, error: error1 } = await supabase
        .from('equipos')
        .select('*')
        .eq('estado', 'Fuera de Servicio')

      if (error1) throw error1

      // Mantenimientos vencidos (simplificado)
      const { data: mantenimientosVencidos, error: error2 } = await supabase
        .from('mantenimientos')
        .select('*')
        .eq('estado', 'Pendiente')
        .lt('fecha_programada', new Date().toISOString())

      if (error2) throw error2

      // Equipos sin mantenimiento reciente (simplificado)
      const { data: equiposActivos, error: error3 } = await supabase
        .from('equipos')
        .select('*')
        .eq('estado', 'Activo')

      if (error3) throw error3

      // Por ahora, solo devolvemos equipos activos como "sin mantenimiento reciente"
      // Esto se puede mejorar cuando tengamos más datos
      const equiposSinMantenimientoReciente = equiposActivos || []

      return {
        equiposFueraServicio: equiposFueraServicio || [],
        mantenimientosVencidos: mantenimientosVencidos || [],
        equiposSinMantenimientoReciente
      }
    } catch (error) {
      console.error('Error al obtener equipos que requieren atención:', error)
      // Devolver datos vacíos en caso de error para que la app no se rompa
      return {
        equiposFueraServicio: [],
        mantenimientosVencidos: [],
        equiposSinMantenimientoReciente: []
      }
    }
  },

  // Obtener tendencias de mantenimiento
  async getTendenciasMantenimiento(meses = 12) {
    try {
      const fechaInicio = new Date()
      fechaInicio.setMonth(fechaInicio.getMonth() - meses)

      const { data, error } = await supabase
        .from('mantenimientos')
        .select('*')
        .gte('fecha_completado', fechaInicio.toISOString())

      if (error) throw error

      // Agrupar por mes
      const tendencias = data.reduce((acc, mantenimiento) => {
        const fecha = new Date(mantenimiento.fecha_completado)
        const mes = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`
        
        if (!acc[mes]) {
          acc[mes] = {
            mes,
            total: 0,
            completados: 0,
            costo: 0
          }
        }
        
        acc[mes].total += 1
        if (mantenimiento.estado === 'Completado') {
          acc[mes].completados += 1
        }
        acc[mes].costo += mantenimiento.costo || 0
        
        return acc
      }, {})

      return Object.values(tendencias).sort((a, b) => a.mes.localeCompare(b.mes))
    } catch (error) {
      console.error('Error al obtener tendencias de mantenimiento:', error)
      throw error
    }
  }
}
