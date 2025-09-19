import { useState, useEffect } from 'react'
import { reportesService } from '../services/reportesService'

export const useReportes = () => {
  const [estadisticas, setEstadisticas] = useState(null)
  const [reporteMantenimientos, setReporteMantenimientos] = useState(null)
  const [equiposRequierenAtencion, setEquiposRequierenAtencion] = useState(null)
  const [tendencias, setTendencias] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Cargar estadísticas generales
  const cargarEstadisticas = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await reportesService.getEstadisticasGenerales()
      setEstadisticas(data)
    } catch (err) {
      setError(err.message)
      console.error('Error al cargar estadísticas:', err)
    } finally {
      setLoading(false)
    }
  }

  // Cargar reporte de mantenimientos por período
  const cargarReporteMantenimientos = async (fechaInicio, fechaFin) => {
    try {
      setLoading(true)
      setError(null)
      const data = await reportesService.getReporteMantenimientos(fechaInicio, fechaFin)
      setReporteMantenimientos(data)
    } catch (err) {
      setError(err.message)
      console.error('Error al cargar reporte de mantenimientos:', err)
    } finally {
      setLoading(false)
    }
  }

  // Cargar equipos que requieren atención
  const cargarEquiposRequierenAtencion = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await reportesService.getEquiposRequierenAtencion()
      setEquiposRequierenAtencion(data)
    } catch (err) {
      setError(err.message)
      console.error('Error al cargar equipos que requieren atención:', err)
    } finally {
      setLoading(false)
    }
  }

  // Cargar tendencias de mantenimiento
  const cargarTendencias = async (meses = 12) => {
    try {
      setLoading(true)
      setError(null)
      const data = await reportesService.getTendenciasMantenimiento(meses)
      setTendencias(data)
    } catch (err) {
      setError(err.message)
      console.error('Error al cargar tendencias:', err)
    } finally {
      setLoading(false)
    }
  }

  // Cargar todos los datos iniciales
  const cargarTodosLosDatos = async () => {
    await Promise.all([
      cargarEstadisticas(),
      cargarEquiposRequierenAtencion(),
      cargarTendencias()
    ])
  }

  // Cargar datos al montar el componente
  useEffect(() => {
    cargarTodosLosDatos()
  }, [])

  return {
    estadisticas,
    reporteMantenimientos,
    equiposRequierenAtencion,
    tendencias,
    loading,
    error,
    cargarEstadisticas,
    cargarReporteMantenimientos,
    cargarEquiposRequierenAtencion,
    cargarTendencias,
    cargarTodosLosDatos
  }
}


