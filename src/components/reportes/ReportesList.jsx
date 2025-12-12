import React, { useState } from 'react'
import { useReportes } from '../../hooks/useReportes'
import ExportButtons from './ExportButtons'
import { 
  ChartBarIcon, 
  ExclamationTriangleIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  WrenchScrewdriverIcon
} from '@heroicons/react/24/outline'
import './ReportesList.css'
import './ExportButtons.css'

const ReportesList = () => {
  const {
    estadisticas,
    reporteMantenimientos,
    equiposRequierenAtencion,
    todosLosEquipos,
    tendencias,
    loading,
    error,
    cargarReporteMantenimientos,
    cargarTodosLosDatos
  } = useReportes()

  const [fechaInicio, setFechaInicio] = useState('')
  const [fechaFin, setFechaFin] = useState('')
  const [reporteGenerado, setReporteGenerado] = useState(false)

  // Generar fechas por defecto (últimos 30 días) y cargar datos
  React.useEffect(() => {
    const hoy = new Date()
    const hace30Dias = new Date(hoy.getTime() - 30 * 24 * 60 * 60 * 1000)
    
    setFechaFin(hoy.toISOString().split('T')[0])
    setFechaInicio(hace30Dias.toISOString().split('T')[0])
    
    // Cargar todos los datos al iniciar
    cargarTodosLosDatos()
    
    // Cargar mantenimientos por defecto (últimos 30 días)
    setTimeout(() => {
      cargarReporteMantenimientos(
        hace30Dias.toISOString().split('T')[0], 
        hoy.toISOString().split('T')[0]
      )
    }, 1000)
  }, [])

  const handleGenerarReporte = async () => {
    if (fechaInicio && fechaFin) {
      await cargarReporteMantenimientos(fechaInicio, fechaFin)
      setReporteGenerado(true)
    }
  }


  const formatearMoneda = (cantidad) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(cantidad || 0)
  }

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-AR')
  }

  if (loading && !estadisticas) {
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
        <ExclamationTriangleIcon className="error-icon" />
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
        equipoSeleccionado={null}
      />

      {/* Estadísticas Generales */}
      {estadisticas && (
        <div className="stats-section">
          <h2 className="section-title">Estadísticas Generales</h2>
          
          <div className="stats-grid">
            <div className="stat-card total">
              <div className="stat-icon">
                <ChartBarIcon className="h-8 w-8" />
              </div>
              <div className="stat-content">
                <h3 className="stat-number">{estadisticas.totalEquipos}</h3>
                <p className="stat-label">Total de Equipos</p>
              </div>
            </div>

            <div className="stat-card active">
              <div className="stat-icon">
                <CheckCircleIcon className="h-8 w-8" />
              </div>
              <div className="stat-content">
                <h3 className="stat-number">{estadisticas.equiposActivos}</h3>
                <p className="stat-label">Equipos Activos</p>
              </div>
            </div>

            <div className="stat-card warning">
              <div className="stat-icon">
                <WrenchScrewdriverIcon className="h-8 w-8" />
              </div>
              <div className="stat-content">
                <h3 className="stat-number">{estadisticas.equiposMantenimiento}</h3>
                <p className="stat-label">En Mantenimiento</p>
              </div>
            </div>

            <div className="stat-card danger">
              <div className="stat-icon">
                <XCircleIcon className="h-8 w-8" />
              </div>
              <div className="stat-content">
                <h3 className="stat-number">{estadisticas.equiposFueraServicio}</h3>
                <p className="stat-label">Fuera de Servicio</p>
              </div>
            </div>

            <div className="stat-card pending">
              <div className="stat-icon">
                <ClockIcon className="h-8 w-8" />
              </div>
              <div className="stat-content">
                <h3 className="stat-number">{estadisticas.mantenimientosPendientes}</h3>
                <p className="stat-label">Mantenimientos Pendientes</p>
              </div>
            </div>

            <div className="stat-card upcoming">
              <div className="stat-icon">
                <CalendarIcon className="h-8 w-8" />
              </div>
              <div className="stat-content">
                <h3 className="stat-number">{estadisticas.proximosMantenimientos}</h3>
                <p className="stat-label">Próximos Mantenimientos</p>
              </div>
            </div>
          </div>

          {/* Distribuciones */}
          <div className="distributions-grid">
            <div className="distribution-card">
              <h3 className="distribution-title">Distribución por Tipo</h3>
              <div className="distribution-list">
                {Object.entries(estadisticas.distribucionTipo).map(([tipo, cantidad]) => (
                  <div key={tipo} className="distribution-item">
                    <span className="distribution-label">{tipo}</span>
                    <span className="distribution-value">{cantidad}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="distribution-card">
              <h3 className="distribution-title">Distribución por Ubicación</h3>
              <div className="distribution-list">
                {Object.entries(estadisticas.distribucionUbicacion).map(([ubicacion, cantidad]) => (
                  <div key={ubicacion} className="distribution-item">
                    <span className="distribution-label">{ubicacion}</span>
                    <span className="distribution-value">{cantidad}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reporte de Mantenimientos por Período */}
      <div className="report-section">
        <h2 className="section-title">Reporte de Mantenimientos por Período</h2>
        
        <div className="date-filters">
          <div className="date-input-group">
            <label htmlFor="fechaInicio">Fecha de Inicio:</label>
            <input
              type="date"
              id="fechaInicio"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              className="date-input"
            />
          </div>
          
          <div className="date-input-group">
            <label htmlFor="fechaFin">Fecha de Fin:</label>
            <input
              type="date"
              id="fechaFin"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
              className="date-input"
            />
          </div>
          
          <button 
            onClick={handleGenerarReporte}
            disabled={!fechaInicio || !fechaFin || loading}
            className="generate-report-btn"
          >
            {loading ? 'Generando...' : 'Generar Reporte'}
          </button>
        </div>

        {reporteMantenimientos && (
          <div className="maintenance-report">
            <div className="report-summary">
              <div className="summary-card">
                <h4>Total de Mantenimientos</h4>
                <p className="summary-number">{reporteMantenimientos.totalMantenimientos}</p>
              </div>
              
              <div className="summary-card">
                <h4>Completados</h4>
                <p className="summary-number">{reporteMantenimientos.mantenimientosCompletados}</p>
              </div>
              
              <div className="summary-card">
                <h4>Pendientes</h4>
                <p className="summary-number">{reporteMantenimientos.mantenimientosPendientes}</p>
              </div>
              
              <div className="summary-card">
                <h4>Costo Total</h4>
                <p className="summary-number">{formatearMoneda(reporteMantenimientos.costoTotal)}</p>
              </div>
            </div>

            {/* Mantenimientos por tipo en el período */}
            {Object.keys(reporteMantenimientos.mantenimientosPorTipo).length > 0 && (
              <div className="maintenance-types">
                <h4>Mantenimientos por Tipo</h4>
                <div className="types-list">
                  {Object.entries(reporteMantenimientos.mantenimientosPorTipo).map(([tipo, cantidad]) => (
                    <div key={tipo} className="type-item">
                      <span className="type-label">{tipo}</span>
                      <span className="type-value">{cantidad}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Equipos que Requieren Atención */}
      {equiposRequierenAtencion && (
        <div className="attention-section">
          <h2 className="section-title">Equipos que Requieren Atención</h2>
          
          <div className="attention-grid">
            <div className="attention-card">
              <h3 className="attention-title">
                <XCircleIcon className="attention-icon" />
                Equipos Fuera de Servicio
              </h3>
              <div className="attention-count">{equiposRequierenAtencion.equiposFueraServicio.length}</div>
              {equiposRequierenAtencion.equiposFueraServicio.length > 0 && (
                <div className="attention-list">
                  {equiposRequierenAtencion.equiposFueraServicio.map(equipo => (
                    <div key={equipo.id} className="attention-item">
                      <span className="equipment-name">{equipo.nombre}</span>
                      <span className="equipment-code">{equipo.codigo_interno}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="attention-card">
              <h3 className="attention-title">
                <ClockIcon className="attention-icon" />
                Mantenimientos Vencidos
              </h3>
              <div className="attention-count">{equiposRequierenAtencion.mantenimientosVencidos.length}</div>
              {equiposRequierenAtencion.mantenimientosVencidos.length > 0 && (
                <div className="attention-list">
                  {equiposRequierenAtencion.mantenimientosVencidos.map(mantenimiento => (
                    <div key={mantenimiento.id} className="attention-item">
                      <span className="equipment-name">{mantenimiento.equipos?.nombre}</span>
                      <span className="equipment-code">
                        Vence: {formatearFecha(mantenimiento.fecha_programada)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="attention-card">
              <h3 className="attention-title">
                <ExclamationTriangleIcon className="attention-icon" />
                Sin Mantenimiento Reciente
              </h3>
              <div className="attention-count">{equiposRequierenAtencion.equiposSinMantenimientoReciente.length}</div>
              {equiposRequierenAtencion.equiposSinMantenimientoReciente.length > 0 && (
                <div className="attention-list">
                  {equiposRequierenAtencion.equiposSinMantenimientoReciente.map(equipo => (
                    <div key={equipo.id} className="attention-item">
                      <span className="equipment-name">{equipo.nombre}</span>
                      <span className="equipment-code">{equipo.codigo_interno}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tendencias */}
      {tendencias && tendencias.length > 0 && (
        <div className="trends-section">
          <h2 className="section-title">Tendencias de Mantenimiento (Últimos 12 meses)</h2>
          
          <div className="trends-table">
            <div className="trends-header">
              <div className="trend-header">Mes</div>
              <div className="trend-header">Total</div>
              <div className="trend-header">Completados</div>
              <div className="trend-header">Costo</div>
            </div>
            
            {tendencias.map(tendencia => (
              <div key={tendencia.mes} className="trend-row">
                <div className="trend-cell">{tendencia.mes}</div>
                <div className="trend-cell">{tendencia.total}</div>
                <div className="trend-cell">{tendencia.completados}</div>
                <div className="trend-cell">{formatearMoneda(tendencia.costo)}</div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  )
}

export default ReportesList
