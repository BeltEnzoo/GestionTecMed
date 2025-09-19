import { supabase } from './supabase'

// Función para mapear campos del formulario a columnas de la base de datos
const mapFormFieldsToDBColumns = (formData) => {
  const dbData = {}
  
  if (formData.equipo !== undefined && formData.equipo !== '') {
    dbData.equipo_id = formData.equipo
  }
  
  if (formData.tipoEvento !== undefined) dbData.tipo_evento = formData.tipoEvento
  if (formData.titulo !== undefined) dbData.titulo = formData.titulo
  if (formData.descripcion !== undefined) dbData.descripcion = formData.descripcion
  
  // Convertir fecha del evento a formato ISO válido
  if (formData.fechaEvento !== undefined && formData.fechaEvento !== '') {
    dbData.fecha_evento = new Date(formData.fechaEvento).toISOString()
  }
  
  if (formData.prioridad !== undefined) dbData.prioridad = formData.prioridad
  if (formData.estado !== undefined) dbData.estado = formData.estado
  if (formData.tecnicoResponsable !== undefined) dbData.tecnico_responsable = formData.tecnicoResponsable
  if (formData.costoReparacion !== undefined) dbData.costo_reparacion = formData.costoReparacion
  
  // Convertir fecha de resolución a formato ISO válido
  if (formData.fechaResolucion !== undefined && formData.fechaResolucion !== '') {
    dbData.fecha_resolucion = new Date(formData.fechaResolucion).toISOString()
  }
  
  if (formData.observacionesResolucion !== undefined) dbData.observaciones_resolucion = formData.observacionesResolucion
  
  return dbData
}

// Función para mapear datos de la base de datos al formato del frontend
const mapDBColumnsToFormFields = (dbData) => {
  return {
    id: dbData.id,
    equipo: dbData.equipo_id,
    equipos: dbData.equipos, // Incluir la relación completa
    tipoEvento: dbData.tipo_evento,
    titulo: dbData.titulo,
    descripcion: dbData.descripcion,
    fechaEvento: dbData.fecha_evento,
    prioridad: dbData.prioridad,
    estado: dbData.estado,
    tecnicoResponsable: dbData.tecnico_responsable,
    costoReparacion: dbData.costo_reparacion,
    fechaResolucion: dbData.fecha_resolucion,
    observacionesResolucion: dbData.observaciones_resolucion,
    createdAt: dbData.created_at,
    updatedAt: dbData.updated_at
  }
}

// Obtener todos los eventos del historial
export const getHistorialEventos = async () => {
  try {
    // Obtener eventos directamente sin relación compleja
    const { data: eventosData, error: eventosError } = await supabase
      .from('historial_eventos')
      .select('*')
      .order('fecha_evento', { ascending: false })

    if (eventosError) throw eventosError

    // Obtener los equipos por separado si hay eventos
    let equiposData = []
    if (eventosData && eventosData.length > 0) {
      const equiposIds = eventosData.map(e => e.equipo_id).filter(Boolean)
      if (equiposIds.length > 0) {
        const { data: equipos, error: equiposError } = await supabase
          .from('equipos')
          .select('*')
          .in('id', equiposIds)

        if (!equiposError) {
          equiposData = equipos || []
        }
      }
    }

    // Combinar los datos manualmente
    const data = eventosData ? eventosData.map(evento => ({
      ...evento,
      equipos: equiposData.find(equipo => equipo.id === evento.equipo_id) || null
    })) : []

    return {
      data: data.map(mapDBColumnsToFormFields),
      error: null
    }
  } catch (error) {
    console.error('Error al obtener eventos del historial:', error)
    return {
      data: [],
      error: error.message
    }
  }
}

// Obtener eventos de un equipo específico
export const getEventosPorEquipo = async (equipoId) => {
  try {
    const { data, error } = await supabase
      .from('historial_eventos')
      .select(`
        *,
        equipos!equipo_id (
          id,
          nombre,
          marca,
          modelo
        )
      `)
      .eq('equipo_id', equipoId)
      .order('fecha_evento', { ascending: false })

    if (error) throw error

    return {
      data: data ? data.map(mapDBColumnsToFormFields) : [],
      error: null
    }
  } catch (error) {
    console.error('Error al obtener eventos del equipo:', error)
    return {
      data: [],
      error: error.message
    }
  }
}

// Crear un nuevo evento
export const createEvento = async (eventoData) => {
  try {
    const dbData = mapFormFieldsToDBColumns(eventoData)
    
    const { data, error } = await supabase
      .from('historial_eventos')
      .insert([dbData])
      .select('*')
      .single()

    if (error) throw error

    // Obtener el equipo por separado
    let equiposData = null
    if (data.equipo_id) {
      const { data: equipo, error: equipoError } = await supabase
        .from('equipos')
        .select('*')
        .eq('id', data.equipo_id)
        .single()

      if (!equipoError) {
        equiposData = equipo
      }
    }

    const eventWithEquipo = {
      ...data,
      equipos: equiposData
    }

    return {
      data: mapDBColumnsToFormFields(eventWithEquipo),
      error: null
    }
  } catch (error) {
    console.error('Error al crear evento:', error)
    return {
      data: null,
      error: error.message
    }
  }
}

// Actualizar un evento existente
export const updateEvento = async (id, eventoData) => {
  try {
    const dbData = mapFormFieldsToDBColumns(eventoData)
    
    const { data, error } = await supabase
      .from('historial_eventos')
      .update(dbData)
      .eq('id', id)
      .select(`
        *,
        equipos:equipo_id (
          id,
          nombre,
          marca,
          modelo
        )
      `)
      .single()

    if (error) throw error

    return {
      data: mapDBColumnsToFormFields(data),
      error: null
    }
  } catch (error) {
    console.error('Error al actualizar evento:', error)
    return {
      data: null,
      error: error.message
    }
  }
}

// Eliminar un evento
export const deleteEvento = async (id) => {
  try {
    const { error } = await supabase
      .from('historial_eventos')
      .delete()
      .eq('id', id)

    if (error) throw error

    return {
      data: true,
      error: null
    }
  } catch (error) {
    console.error('Error al eliminar evento:', error)
    return {
      data: false,
      error: error.message
    }
  }
}

// Obtener estadísticas de eventos
export const getEstadisticasEventos = async () => {
  try {
    const { data: eventos, error } = await supabase
      .from('historial_eventos')
      .select('*')

    if (error) throw error

    const eventosData = eventos || []
    
    // Estadísticas por tipo
    const porTipo = eventosData.reduce((acc, evento) => {
      const tipo = evento.tipo_evento || 'Sin especificar'
      acc[tipo] = (acc[tipo] || 0) + 1
      return acc
    }, {})

    // Estadísticas por estado
    const porEstado = eventosData.reduce((acc, evento) => {
      const estado = evento.estado || 'Sin especificar'
      acc[estado] = (acc[estado] || 0) + 1
      return acc
    }, {})

    // Estadísticas por prioridad
    const porPrioridad = eventosData.reduce((acc, evento) => {
      const prioridad = evento.prioridad || 'Sin especificar'
      acc[prioridad] = (acc[prioridad] || 0) + 1
      return acc
    }, {})

    // Eventos recientes (últimos 7 días)
    const hace7Dias = new Date()
    hace7Dias.setDate(hace7Dias.getDate() - 7)
    const eventosRecientes = eventosData.filter(evento => 
      new Date(evento.fecha_evento) >= hace7Dias
    ).length

    // Eventos pendientes (no resueltos)
    const eventosPendientes = eventosData.filter(evento => 
      evento.estado !== 'Resuelto' && evento.estado !== 'Cancelado'
    ).length

    return {
      totalEventos: eventosData.length,
      eventosRecientes,
      eventosPendientes,
      porTipo,
      porEstado,
      porPrioridad
    }
  } catch (error) {
    console.error('Error al obtener estadísticas de eventos:', error)
    return {
      totalEventos: 0,
      eventosRecientes: 0,
      eventosPendientes: 0,
      porTipo: {},
      porEstado: {},
      porPrioridad: {}
    }
  }
}
