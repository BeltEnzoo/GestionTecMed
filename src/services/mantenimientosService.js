import { api } from './api'

const mapFormFieldsToDBColumns = (formData) => {
  const dbData = {}

  if (formData.equipo !== undefined && formData.equipo !== '') {
    dbData.equipo = formData.equipo
  }
  if (formData.equipoId !== undefined) dbData.equipo_id = formData.equipoId
  if (formData.tipo !== undefined) dbData.tipo = formData.tipo
  if (formData.tecnico !== undefined) dbData.tecnico = formData.tecnico
  if (formData.fechaProgramada !== undefined) dbData.fecha_programada = formData.fechaProgramada
  if (formData.descripcion !== undefined) dbData.descripcion = formData.descripcion
  if (formData.costo !== undefined) dbData.costo = formData.costo
  if (formData.estado !== undefined) dbData.estado = formData.estado
  if (formData.observaciones !== undefined) dbData.observaciones = formData.observaciones

  if (formData.estado === 'Completado' && !formData.fechaCompletado) {
    dbData.fecha_completado = new Date().toISOString().split('T')[0]
  } else if (formData.fechaCompletado !== undefined) {
    dbData.fecha_completado = formData.fechaCompletado
  }

  return dbData
}

const mapDBColumnsToFormFields = (dbData) => ({
  id: dbData.id,
  equipo: dbData.equipo_id,
  equipos: dbData.equipos,
  tipo: dbData.tipo,
  tecnico: dbData.tecnico,
  fechaProgramada: dbData.fecha_programada,
  fechaCompletado: dbData.fecha_completado,
  descripcion: dbData.descripcion,
  costo: dbData.costo,
  estado: dbData.estado,
  createdAt: dbData.created_at,
  updatedAt: dbData.updated_at,
})

export const getMantenimientos = async () => {
  try {
    const { data } = await api('/api/mantenimientos')
    return {
      data: data ? data.map(mapDBColumnsToFormFields) : [],
      error: null,
    }
  } catch (error) {
    console.error('Error al obtener mantenimientos:', error)
    return { data: [], error: error.message }
  }
}

export const createMantenimiento = async (mantenimientoData) => {
  try {
    const dbData = mapFormFieldsToDBColumns(mantenimientoData)
    const { data } = await api('/api/mantenimientos', {
      method: 'POST',
      body: JSON.stringify(dbData),
    })
    return { data: mapDBColumnsToFormFields(data), error: null }
  } catch (error) {
    console.error('Error al crear mantenimiento:', error)
    return { data: null, error: error.message }
  }
}

export const updateMantenimiento = async (id, mantenimientoData) => {
  try {
    const dbData = mapFormFieldsToDBColumns(mantenimientoData)
    const { data } = await api(`/api/mantenimientos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(dbData),
    })
    return { data: mapDBColumnsToFormFields(data), error: null }
  } catch (error) {
    console.error('Error al actualizar mantenimiento:', error)
    return { data: null, error: error.message }
  }
}

export const deleteMantenimiento = async (id) => {
  try {
    await api(`/api/mantenimientos/${id}`, { method: 'DELETE' })
    return { data: true, error: null }
  } catch (error) {
    console.error('Error al eliminar mantenimiento:', error)
    return { data: false, error: error.message }
  }
}

export const searchMantenimientos = async (searchTerm, filterStatus = 'todos') => {
  try {
    const { data } = await api('/api/mantenimientos')
    let filtered = data || []

    if (filterStatus !== 'todos') {
      filtered = filtered.filter((m) => m.estado === filterStatus)
    }

    if (searchTerm?.trim()) {
      const q = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (m) =>
          m.tecnico?.toLowerCase().includes(q) ||
          m.descripcion?.toLowerCase().includes(q)
      )
    }

    filtered = filtered.sort(
      (a, b) => new Date(b.created_at) - new Date(a.created_at)
    )

    return {
      data: filtered.map(mapDBColumnsToFormFields),
      error: null,
    }
  } catch (error) {
    console.error('Error al buscar mantenimientos:', error)
    return { data: [], error: error.message }
  }
}
