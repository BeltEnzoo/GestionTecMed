import React, { useState } from 'react'
import { useReportes } from '../../hooks/useReportes'
import { useHistorial } from '../../hooks/useHistorial'
import EventoForm from './EventoForm'
import { 
  ChartBarIcon, 
  ExclamationTriangleIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  WrenchScrewdriverIcon,
  PlusIcon,
  DocumentTextIcon,
  EyeIcon
} from '@heroicons/react/24/outline'
import './ReportesList.css'

const ReportesList = () => {
  const {
    estadisticas,
    reporteMantenimientos,
    equiposRequierenAtencion,
    tendencias,
    loading,
    error,
    cargarReporteMantenimientos,
    cargarTodosLosDatos
  } = useReportes()

  const [fechaInicio, setFechaInicio] = useState('')
  const [fechaFin, setFechaFin] = useState('')
  const [reporteGenerado, setReporteGenerado] = useState(false)
  const [showEventoForm, setShowEventoForm] = useState(false)
  const [eventoToEdit, setEventoToEdit] = useState(null)
  const [showHistorial, setShowHistorial] = useState(false)

  const { eventos, cargarEventos } = useHistorial()

  // Generar fechas por defecto (últimos 30 días)
  React.useEffect(() => {
    const hoy = new Date()
    const hace30Dias = new Date(hoy.getTime() - 30 * 24 * 60 * 60 * 1000)
    
    setFechaFin(hoy.toISOString().split('T')[0])
    setFechaInicio(hace30Dias.toISOString().split('T')[0])
  }, [])

  const handleGenerarReporte = async () => {
    if (fechaInicio && fechaFin) {
      await cargarReporteMantenimientos(fechaInicio, fechaFin)
      setReporteGenerado(true)
    }
  }

  const handleNuevoEvento = () => {
    setEventoToEdit(null)
    setShowEventoForm(true)
  }

  const handleEditarEvento = (evento) => {
    setEventoToEdit(evento)
    setShowEventoForm(true)
  }

  const handleEventoSuccess = () => {
    cargarEventos()
    cargarTodosLosDatos()
  }

  const handleCloseEventoForm = () => {
    setShowEventoForm(false)
    setEventoToEdit(null)
  }

  const toggleHistorial = () => {
    setShowHistorial(!showHistorial)
    if (!showHistorial) {
      cargarEventos()
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

      {/* Gestión de Eventos */}
      <div className="events-section">
        <div className="events-header">
          <h2 className="section-title">Registro de Eventos y Fallas</h2>
          <div className="events-actions">
            <button
              onClick={toggleHistorial}
              className="btn-secondary"
            >
              <EyeIcon className="btn-icon" />
              {showHistorial ? 'Ocultar' : 'Ver'} Historial
            </button>
            <button
              onClick={handleNuevoEvento}
              className="btn-primary"
            >
              <PlusIcon className="btn-icon" />
              Registrar Evento
            </button>
          </div>
        </div>

        {showHistorial && (
          <div className="historial-container">
            <div className="historial-header">
              <h3>Historial de Eventos</h3>
              <span className="eventos-count">{eventos.length} eventos registrados</span>
            </div>
            
            {eventos.length === 0 ? (
              <div className="empty-state">
                <DocumentTextIcon className="empty-icon" />
                <p>No hay eventos registrados</p>
                <p className="empty-subtitle">Los eventos y fallas de equipos aparecerán aquí</p>
              </div>
            ) : (
              <div className="eventos-list">
                {eventos.map(evento => (
                  <div key={evento.id} className="evento-card">
                    <div className="evento-header">
                      <div className="evento-info">
                        <h4 className="evento-titulo">{evento.titulo}</h4>
                        <div className="evento-meta">
                          <span className="evento-equipo">
                            {evento.equipos?.nombre || 'Equipo no encontrado'}
                          </span>
                          <span className="evento-fecha">
                            {formatearFecha(evento.fechaEvento)}
                          </span>
                        </div>
                      </div>
                      <div className="evento-badges">
                        <span className={`tipo-badge ${evento.tipoEvento.toLowerCase().replace(' ', '-')}`}>
                          {evento.tipoEvento}
                        </span>
                        <span className={`prioridad-badge ${evento.prioridad.toLowerCase()}`}>
                          {evento.prioridad}
                        </span>
                        <span className={`estado-badge ${evento.estado.toLowerCase().replace(' ', '-')}`}>
                          {evento.estado}
                        </span>
                      </div>
                    </div>
                    
                    {evento.descripcion && (
                      <div className="evento-descripcion">
                        <p>{evento.descripcion}</p>
                      </div>
                    )}
                    
                    <div className="evento-footer">
                      <div className="evento-details">
                        {evento.tecnicoResponsable && (
                          <span className="evento-detail">
                            <strong>Técnico:</strong> {evento.tecnicoResponsable}
                          </span>
                        )}
                        {evento.costoReparacion && (
                          <span className="evento-detail">
                            <strong>Costo:</strong> {formatearMoneda(evento.costoReparacion)}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => handleEditarEvento(evento)}
                        className="btn-edit"
                      >
                        Editar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Formulario de Evento */}
      {showEventoForm && (
        <EventoForm
          evento={eventoToEdit}
          onClose={handleCloseEventoForm}
          onSuccess={handleEventoSuccess}
        />
      )}
    </div>
  )
}

export default ReportesList
