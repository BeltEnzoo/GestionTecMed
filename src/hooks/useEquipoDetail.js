import { useState, useEffect } from 'react'
import { equiposService } from '../services/equiposService'

export const useEquipoDetail = (equipoId) => {
  const [equipo, setEquipo] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const cargarEquipo = async () => {
    if (!equipoId) return

    try {
      setLoading(true)
      setError(null)
      const result = await equiposService.getEquipoById(equipoId)
      
      if (result.error) {
        setError(result.error)
      } else {
        setEquipo(result.data)
      }
    } catch (err) {
      setError(err.message)
      console.error('Error al cargar equipo:', err)
    } finally {
      setLoading(false)
    }
  }

  const actualizarEquipo = async (equipoData) => {
    try {
      setLoading(true)
      setError(null)
      const result = await equiposService.updateEquipo(equipoId, equipoData)
      
      if (result.error) {
        setError(result.error)
        return { success: false, error: result.error }
      } else {
        // Recargar los datos del equipo
        await cargarEquipo()
        return { success: true, data: result.data }
      }
    } catch (err) {
      const errorMsg = err.message
      setError(errorMsg)
      console.error('Error al actualizar equipo:', err)
      return { success: false, error: errorMsg }
    } finally {
      setLoading(false)
    }
  }

  const eliminarEquipo = async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await equiposService.deleteEquipo(equipoId)
      
      if (result.error) {
        setError(result.error)
        return { success: false, error: result.error }
      } else {
        return { success: true }
      }
    } catch (err) {
      const errorMsg = err.message
      setError(errorMsg)
      console.error('Error al eliminar equipo:', err)
      return { success: false, error: errorMsg }
    } finally {
      setLoading(false)
    }
  }

  // Cargar equipo cuando cambie el ID
  useEffect(() => {
    cargarEquipo()
  }, [equipoId])

  return {
    equipo,
    loading,
    error,
    cargarEquipo,
    actualizarEquipo,
    eliminarEquipo
  }
}


