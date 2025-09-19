import { useState, useEffect } from 'react'
import { equiposService } from '../services/equiposService'

export const useEquipos = () => {
  const [equipos, setEquipos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Cargar todos los equipos
  const loadEquipos = async () => {
    try {
      setLoading(true)
      setError(null)
      const { data, error } = await equiposService.getAll()
      if (error) throw error
      setEquipos(data || [])
    } catch (err) {
      setError(err.message)
      console.error('Error loading equipos:', err)
    } finally {
      setLoading(false)
    }
  }

  // Cargar equipos al montar el componente
  useEffect(() => {
    loadEquipos()
  }, [])

  // Crear nuevo equipo
  const createEquipo = async (equipoData) => {
    try {
      setError(null)
      const { data, error } = await equiposService.create(equipoData)
      if (error) throw error
      
      // Actualizar la lista local
      setEquipos(prev => [data, ...prev])
      return { data, error: null }
    } catch (err) {
      setError(err.message)
      return { data: null, error: err.message }
    }
  }

  // Actualizar equipo
  const updateEquipo = async (id, equipoData) => {
    try {
      setError(null)
      const { data, error } = await equiposService.update(id, equipoData)
      if (error) throw error
      
      // Actualizar la lista local
      setEquipos(prev => prev.map(equipo => 
        equipo.id === id ? data : equipo
      ))
      return { data, error: null }
    } catch (err) {
      setError(err.message)
      return { data: null, error: err.message }
    }
  }

  // Eliminar equipo
  const deleteEquipo = async (id) => {
    try {
      setError(null)
      const { error } = await equiposService.delete(id)
      if (error) throw error
      
      // Actualizar la lista local
      setEquipos(prev => prev.filter(equipo => equipo.id !== id))
      return { error: null }
    } catch (err) {
      setError(err.message)
      return { error: err.message }
    }
  }

  // Buscar equipos
  const searchEquipos = async (searchTerm) => {
    try {
      setLoading(true)
      setError(null)
      const { data, error } = await equiposService.search(searchTerm)
      if (error) throw error
      setEquipos(data || [])
    } catch (err) {
      setError(err.message)
      console.error('Error searching equipos:', err)
    } finally {
      setLoading(false)
    }
  }

  // Obtener estadísticas
  const getStats = async () => {
    try {
      setError(null)
      const { data, error } = await equiposService.getStats()
      if (error) throw error
      return { data, error: null }
    } catch (err) {
      setError(err.message)
      return { data: null, error: err.message }
    }
  }

  // Obtener equipos por estado
  const getEquiposByEstado = async (estado) => {
    try {
      setLoading(true)
      setError(null)
      const { data, error } = await equiposService.getByEstado(estado)
      if (error) throw error
      setEquipos(data || [])
    } catch (err) {
      setError(err.message)
      console.error('Error loading equipos by estado:', err)
    } finally {
      setLoading(false)
    }
  }

  // Obtener equipos por departamento
  const getEquiposByDepartamento = async (departamento) => {
    try {
      setLoading(true)
      setError(null)
      const { data, error } = await equiposService.getByDepartamento(departamento)
      if (error) throw error
      setEquipos(data || [])
    } catch (err) {
      setError(err.message)
      console.error('Error loading equipos by departamento:', err)
    } finally {
      setLoading(false)
    }
  }

  return {
    equipos,
    loading,
    error,
    loadEquipos,
    createEquipo,
    updateEquipo,
    deleteEquipo,
    searchEquipos,
    getStats,
    getEquiposByEstado,
    getEquiposByDepartamento
  }
}

