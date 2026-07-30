import { api } from './api'

const mapFormFieldsToDBColumns = (formData) => {
  const dbData = {}

  if (formData.equipo !== undefined && formData.equipo !== '') {
    dbData.equipo_id = formData.equipo
  }

  if (formData.tipoEvento !== undefined) dbData.tipo_evento = formData.tipoEvento
  if (formData.titulo !== undefined) dbData.titulo = formData.titulo
  if (formData.descripcion !== undefined) dbData.descripcion = formData.descripcion

  if (formData.fechaEvento !== undefined && formData.fechaEvento !== '') {
    dbData.fecha_evento = new Date(formData.fechaEvento).toISOString()
  }

  if (formData.prioridad !== undefined) dbData.prioridad = formData.prioridad
  if (formData.estado !== undefined) dbData.estado = formData.estado
  if (formData.tecnicoResponsable !== undefined) {
    dbData.tecnico_responsable = formData.tecnicoResponsable
  }
  if (formData.costoReparacion !== undefined) {
    dbData.costo_reparacion = formData.costoReparacion
  }

  if (formData.fechaResolucion !== undefined && formData.fechaResolucion !== '') {
    dbData.fecha_resolucion = new Date(formData.fechaResolucion).toISOString()
  }

  if (formData.observacionesResolucion !== undefined) {
    dbData.observaciones_resolucion = formData.observacionesResolucion
  }

  return dbData
}

const mapDBColumnsToFormFields = (dbData) => ({
  id: dbData.id,
  equipo: dbData.equipo_id,
  equipos: dbData.equipos,
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
  updatedAt: dbData.updated_at,
})

export const getHistorialEventos = async () => {
  try {
    const { data } = await api('/api/eventos')
    return {
      data: (data || []).map(mapDBColumnsToFormFields),
      error: null,
    }
  } catch (error) {
    console.error('Error al obtener eventos del historial:', error)
    return { data: [], error: error.message }
  }
}

export const getEventosPorEquipo = async (equipoId) => {
  try {
    const { data } = await api(`/api/eventos/equipo/${equipoId}`)
    return {
      data: (data || []).map(mapDBColumnsToFormFields),
      error: null,
    }
  } catch (error) {
    console.error('Error al obtener eventos del equipo:', error)
    return { data: [], error: error.message }
  }
}

export const createEvento = async (eventoData) => {
  try {
    const dbData = mapFormFieldsToDBColumns(eventoData)
    const { data } = await api('/api/eventos', {
      method: 'POST',
      body: JSON.stringify(dbData),
    })
    return { data: mapDBColumnsToFormFields(data), error: null }
  } catch (error) {
    console.error('Error al crear evento:', error)
    return { data: null, error: error.message }
  }
}

export const updateEvento = async (id, eventoData) => {
  try {
    const dbData = mapFormFieldsToDBColumns(eventoData)
    const { data } = await api(`/api/eventos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(dbData),
    })
    return { data: mapDBColumnsToFormFields(data), error: null }
  } catch (error) {
    console.error('Error al actualizar evento:', error)
    return { data: null, error: error.message }
  }
}

export const deleteEvento = async (id) => {
  try {
    await api(`/api/eventos/${id}`, { method: 'DELETE' })
    return { data: true, error: null }
  } catch (error) {
    console.error('Error al eliminar evento:', error)
    return { data: false, error: error.message }
  }
}

export const getEstadisticasEventos = async () => {
  try {
    const { data: eventos } = await api('/api/eventos')
    const eventosData = eventos || []

    const porTipo = eventosData.reduce((acc, evento) => {
      const tipo = evento.tipo_evento || 'Sin especificar'
      acc[tipo] = (acc[tipo] || 0) + 1
      return acc
    }, {})

    const porEstado = eventosData.reduce((acc, evento) => {
      const estado = evento.estado || 'Sin especificar'
      acc[estado] = (acc[estado] || 0) + 1
      return acc
    }, {})

    const porPrioridad = eventosData.reduce((acc, evento) => {
      const prioridad = evento.prioridad || 'Sin especificar'
      acc[prioridad] = (acc[prioridad] || 0) + 1
      return acc
    }, {})

    const hace7Dias = new Date()
    hace7Dias.setDate(hace7Dias.getDate() - 7)
    const eventosRecientes = eventosData.filter(
      (evento) => new Date(evento.fecha_evento) >= hace7Dias
    ).length

    const eventosPendientes = eventosData.filter(
      (evento) => evento.estado !== 'Resuelto' && evento.estado !== 'Cancelado'
    ).length

    return {
      totalEventos: eventosData.length,
      eventosRecientes,
      eventosPendientes,
      porTipo,
      porEstado,
      porPrioridad,
    }
  } catch (error) {
    console.error('Error al obtener estadísticas de eventos:', error)
    return {
      totalEventos: 0,
      eventosRecientes: 0,
      eventosPendientes: 0,
      porTipo: {},
      porEstado: {},
      porPrioridad: {},
    }
  }
}
