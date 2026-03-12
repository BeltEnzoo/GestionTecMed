import React, { useState, useEffect } from 'react'
import { useReportes } from '../../hooks/useReportes'
import ExportButtons from './ExportButtons'
import './ReportesList.css'
import './ExportButtons.css'

const ReportesList = () => {
  const {
    todosLosEquipos,
    reporteMantenimientos,
    loading,
    error,
    cargarTodosLosDatos,
    cargarReporteMantenimientos
  } = useReportes()

  const [equipoSeleccionado, setEquipoSeleccionado] = useState(null)

  // Cargar datos al iniciar
  useEffect(() => {
    cargarTodosLosDatos()
    
    // Cargar mantenimientos (últimos 30 días)
    const hoy = new Date()
    const hace30Dias = new Date(hoy.getTime() - 30 * 24 * 60 * 60 * 1000)
    
    setTimeout(() => {
      cargarReporteMantenimientos(
        hace30Dias.toISOString().split('T')[0], 
        hoy.toISOString().split('T')[0]
      )
    }, 1000)
  }, [])

  if (loading && !todosLosEquipos) {
    return (
      <div className="reportes-loading">
        <div className="loading-spinner"></div>
        <p>Cargando reportes...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="reportes-error">
        <p>Error al cargar los reportes: {error}</p>
        <button onClick={cargarTodosLosDatos} className="retry-btn">
          Reintentar
        </button>
      </div>
    )
  }

  return (
    <div className="reportes-container">
      <div className="reportes-header">
        <h1 className="reportes-title">Reportes y Estadísticas</h1>
        <p className="reportes-subtitle">
          Análisis completo del estado de la tecnología médica
        </p>
      </div>

      {/* Botones de Exportación */}
      <ExportButtons 
        equipos={todosLosEquipos || []}
        mantenimientos={reporteMantenimientos || []}
        eventos={[]}
        equipoSeleccionado={equipoSeleccionado}
      />
    </div>
  )
}

export default ReportesList
