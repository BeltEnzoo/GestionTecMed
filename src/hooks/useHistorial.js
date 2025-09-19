import { useState, useEffect } from 'react'
import { 
  getHistorialEventos, 
  getEventosPorEquipo, 
  createEvento, 
  updateEvento, 
  deleteEvento,
  getEstadisticasEventos
} from '../services/historialService'

export const useHistorial = () => {
  const [eventos, setEventos] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Cargar todos los eventos
  const cargarEventos = async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await getHistorialEventos()
      if (result.error) {
        setError(result.error)
      } else {
        setEventos(result.data)
      }
    } catch (err) {
      setError(err.message)
      console.error('Error al cargar eventos:', err)
    } finally {
      setLoading(false)
    }
  }

  // Cargar eventos de un equipo específico
  const cargarEventosPorEquipo = async (equipoId) => {
    try {
      setLoading(true)
      setError(null)
      const result = await getEventosPorEquipo(equipoId)
      if (result.error) {
        setError(result.error)
      } else {
        setEventos(result.data)
      }
    } catch (err) {
      setError(err.message)
      console.error('Error al cargar eventos del equipo:', err)
    } finally {
      setLoading(false)
    }
  }

  // Crear un nuevo evento
  const crearEvento = async (eventoData) => {
    try {
      setLoading(true)
      setError(null)
      const result = await createEvento(eventoData)
      if (result.error) {
        setError(result.error)
        return { success: false, error: result.error }
      } else {
        // Actualizar la lista de eventos
        await cargarEventos()
        return { success: true, data: result.data }
      }
    } catch (err) {
      const errorMsg = err.message
      setError(errorMsg)
      console.error('Error al crear evento:', err)
      return { success: false, error: errorMsg }
    } finally {
      setLoading(false)
    }
  }

  // Actualizar un evento
  const actualizarEvento = async (id, eventoData) => {
    try {
      setLoading(true)
      setError(null)
      const result = await updateEvento(id, eventoData)
      if (result.error) {
        setError(result.error)
        return { success: false, error: result.error }
      } else {
        // Actualizar la lista de eventos
        await cargarEventos()
        return { success: true, data: result.data }
      }
    } catch (err) {
      const errorMsg = err.message
      setError(errorMsg)
      console.error('Error al actualizar evento:', err)
      return { success: false, error: errorMsg }
    } finally {
      setLoading(false)
    }
  }

  // Eliminar un evento
  const eliminarEvento = async (id) => {
    try {
      setLoading(true)
      setError(null)
      const result = await deleteEvento(id)
      if (result.error) {
        setError(result.error)
        return { success: false, error: result.error }
      } else {
        // Actualizar la lista de eventos
        await cargarEventos()
        return { success: true }
      }
    } catch (err) {
      const errorMsg = err.message
      setError(errorMsg)
      console.error('Error al eliminar evento:', err)
      return { success: false, error: errorMsg }
    } finally {
      setLoading(false)
    }
  }

  // Cargar eventos al montar el componente
  useEffect(() => {
    cargarEventos()
  }, [])

  return {
    eventos,
    loading,
    error,
    cargarEventos,
    cargarEventosPorEquipo,
    crearEvento,
    actualizarEvento,
    eliminarEvento
  }
}

// Hook específico para estadísticas de eventos
export const useEstadisticasEventos = () => {
  const [estadisticas, setEstadisticas] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const cargarEstadisticas = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getEstadisticasEventos()
      setEstadisticas(data)
    } catch (err) {
      setError(err.message)
      console.error('Error al cargar estadísticas de eventos:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    cargarEstadisticas()
  }, [])

  return {
    estadisticas,
    loading,
    error,
    cargarEstadisticas
  }
}


