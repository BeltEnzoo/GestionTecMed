import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useEquipoDetail } from '../../hooks/useEquipoDetail'
import { 
  ArrowLeftIcon,
  PencilIcon,
  TrashIcon,
  CalendarIcon,
  MapPinIcon,
  UserIcon,
  CpuChipIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  WrenchScrewdriverIcon
} from '@heroicons/react/24/outline'
import './EquipoDetail.css'

const EquipoDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { equipo, loading, error } = useEquipoDetail(id)
  const [activeTab, setActiveTab] = useState('info')

  const formatearFecha = (fecha) => {
    if (!fecha) return 'No especificado'
    return new Date(fecha).toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatearMoneda = (cantidad) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(cantidad || 0)
  }

  const getEstadoColor = (estado) => {
    switch (estado?.toLowerCase()) {
      case 'activo':
        return 'green'
      case 'en mantenimiento':
        return 'yellow'
      case 'fuera de servicio':
        return 'red'
      default:
        return 'gray'
    }
  }

  const getTipoEventoColor = (tipo) => {
    switch (tipo?.toLowerCase()) {
      case 'falla':
        return 'red'
      case 'reparación':
        return 'blue'
      case 'observación':
        return 'green'
      case 'incidente':
        return 'orange'
      case 'mantenimiento preventivo':
        return 'purple'
      case 'mantenimiento correctivo':
        return 'pink'
      default:
        return 'gray'
    }
  }

  if (loading) {
    return (
      <div className="equipo-detail-loading">
        <div className="loading-spinner"></div>
        <p>Cargando información del equipo...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="equipo-detail-error">
        <ExclamationTriangleIcon className="error-icon" />
        <h2>Error al cargar el equipo</h2>
        <p>{error}</p>
        <button onClick={() => navigate('/equipos')} className="btn-primary">
          Volver a Equipos
        </button>
      </div>
    )
  }

  if (!equipo) {
    return (
      <div className="equipo-detail-not-found">
        <CpuChipIcon className="not-found-icon" />
        <h2>Equipo no encontrado</h2>
        <p>El equipo que buscas no existe o fue eliminado.</p>
        <button onClick={() => navigate('/equipos')} className="btn-primary">
          Volver a Equipos
        </button>
      </div>
    )
  }

  return (
    <div className="equipo-detail-container">
      {/* Header */}
      <div className="equipo-detail-header">
        <div className="header-top">
          <button
            onClick={() => navigate('/equipos')}
            className="back-button"
            aria-label="Volver a equipos"
          >
            <ArrowLeftIcon className="back-icon" />
            Volver a Equipos
          </button>
          
          <div className="header-actions">
            <button className="btn-secondary">
              <PencilIcon className="btn-icon" />
              Editar
            </button>
            <button className="btn-danger">
              <TrashIcon className="btn-icon" />
              Eliminar
            </button>
          </div>
        </div>

        <div className="equipo-title-section">
          <div className="equipo-title">
            <h1>{equipo.nombre}</h1>
            <div className="equipo-subtitle">
              <span className="equipo-modelo">{equipo.marca} {equipo.modelo}</span>
              {equipo.codigoInterno && (
                <span className="equipo-codigo">Código: {equipo.codigoInterno}</span>
              )}
            </div>
          </div>
          
          <div className="equipo-status">
            <span className={`status-badge ${getEstadoColor(equipo.estado)}`}>
              {equipo.estado}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="equipo-tabs">
        <button
          className={`tab-button ${activeTab === 'info' ? 'active' : ''}`}
          onClick={() => setActiveTab('info')}
        >
          <DocumentTextIcon className="tab-icon" />
          Información General
        </button>
        <button
          className={`tab-button ${activeTab === 'historial' ? 'active' : ''}`}
          onClick={() => setActiveTab('historial')}
        >
          <CalendarIcon className="tab-icon" />
          Hoja de Vida ({equipo.eventos?.length || 0})
        </button>
        <button
          className={`tab-button ${activeTab === 'mantenimientos' ? 'active' : ''}`}
          onClick={() => setActiveTab('mantenimientos')}
        >
          <WrenchScrewdriverIcon className="tab-icon" />
          Mantenimientos ({equipo.mantenimientos?.length || 0})
        </button>
      </div>

      {/* Tab Content */}
      <div className="equipo-content">
        {activeTab === 'info' && (
          <div className="equipo-info">
            <div className="info-grid">
              {/* Información Básica */}
              <div className="info-section">
                <h3>Información Básica</h3>
                <div className="info-items">
                  <div className="info-item">
                    <span className="info-label">Marca:</span>
                    <span className="info-value">{equipo.marca || 'No especificado'}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Modelo:</span>
                    <span className="info-value">{equipo.modelo || 'No especificado'}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Número de Serie:</span>
                    <span className="info-value">{equipo.numeroSerie || 'No especificado'}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Categoría:</span>
                    <span className="info-value">{equipo.categoria || 'No especificado'}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Año de Fabricación:</span>
                    <span className="info-value">{equipo.añoFabricacion || 'No especificado'}</span>
                  </div>
                </div>
              </div>

              {/* Ubicación */}
              <div className="info-section">
                <h3>Ubicación</h3>
                <div className="info-items">
                  <div className="info-item">
                    <span className="info-label">Edificio:</span>
                    <span className="info-value">{equipo.edificio || 'No especificado'}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Piso:</span>
                    <span className="info-value">{equipo.piso || 'No especificado'}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Sala:</span>
                    <span className="info-value">{equipo.sala || 'No especificado'}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Cama:</span>
                    <span className="info-value">{equipo.cama || 'No especificado'}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Departamento:</span>
                    <span className="info-value">{equipo.departamento || 'No especificado'}</span>
                  </div>
                </div>
              </div>

              {/* Responsable */}
              <div className="info-section">
                <h3>Responsable</h3>
                <div className="info-items">
                  <div className="info-item">
                    <span className="info-label">Responsable:</span>
                    <span className="info-value">{equipo.responsable || 'No especificado'}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Proveedor de Mantenimiento:</span>
                    <span className="info-value">{equipo.proveedorMantenimiento || 'No especificado'}</span>
                  </div>
                </div>
              </div>

              {/* Costos */}
              <div className="info-section">
                <h3>Información Económica</h3>
                <div className="info-items">
                  <div className="info-item">
                    <span className="info-label">Costo de Adquisición:</span>
                    <span className="info-value">{formatearMoneda(equipo.costoAdquisicion)}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Valor Actual:</span>
                    <span className="info-value">{formatearMoneda(equipo.valorActual)}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Costo Promedio de Mantenimiento:</span>
                    <span className="info-value">{formatearMoneda(equipo.costoPromedioMantenimiento)}</span>
                  </div>
                </div>
              </div>

              {/* Notas */}
              {equipo.notas && (
                <div className="info-section full-width">
                  <h3>Notas</h3>
                  <div className="info-notes">
                    <p>{equipo.notas}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'historial' && (
          <div className="equipo-historial">
            <div className="historial-header">
              <h3>Historial de Eventos</h3>
              <p>Registro cronológico de todos los eventos y fallas del equipo</p>
            </div>

            {equipo.eventos && equipo.eventos.length > 0 ? (
              <div className="eventos-timeline">
                {equipo.eventos.map((evento, index) => (
                  <div key={evento.id} className="timeline-item">
                    <div className="timeline-marker">
                      <div className={`marker-dot ${getTipoEventoColor(evento.tipo_evento)}`}></div>
                      {index < equipo.eventos.length - 1 && <div className="timeline-line"></div>}
                    </div>
                    
                    <div className="timeline-content">
                      <div className="evento-header">
                        <h4 className="evento-titulo">{evento.titulo}</h4>
                        <div className="evento-badges">
                          <span className={`tipo-badge ${getTipoEventoColor(evento.tipo_evento)}`}>
                            {evento.tipo_evento}
                          </span>
                          <span className={`prioridad-badge ${evento.prioridad?.toLowerCase()}`}>
                            {evento.prioridad}
                          </span>
                        </div>
                      </div>
                      
                      <div className="evento-meta">
                        <span className="evento-fecha">
                          <CalendarIcon className="meta-icon" />
                          {formatearFecha(evento.fecha_evento)}
                        </span>
                        {evento.tecnico_responsable && (
                          <span className="evento-tecnico">
                            <UserIcon className="meta-icon" />
                            {evento.tecnico_responsable}
                          </span>
                        )}
                        {evento.costo_reparacion && (
                          <span className="evento-costo">
                            <CurrencyDollarIcon className="meta-icon" />
                            {formatearMoneda(evento.costo_reparacion)}
                          </span>
                        )}
                      </div>
                      
                      {evento.descripcion && (
                        <div className="evento-descripcion">
                          <p>{evento.descripcion}</p>
                        </div>
                      )}
                      
                      <div className="evento-estado">
                        <span className={`estado-badge ${evento.estado?.toLowerCase().replace(' ', '-')}`}>
                          {evento.estado}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-historial">
                <DocumentTextIcon className="empty-icon" />
                <h4>No hay eventos registrados</h4>
                <p>Este equipo no tiene eventos en su historial aún.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'mantenimientos' && (
          <div className="equipo-mantenimientos">
            <div className="mantenimientos-header">
              <h3>Mantenimientos</h3>
              <p>Registro de mantenimientos programados y realizados</p>
            </div>

            {equipo.mantenimientos && equipo.mantenimientos.length > 0 ? (
              <div className="mantenimientos-list">
                {equipo.mantenimientos.map(mantenimiento => (
                  <div key={mantenimiento.id} className="mantenimiento-card">
                    <div className="mantenimiento-header">
                      <h4>{mantenimiento.tipo}</h4>
                      <span className={`estado-badge ${mantenimiento.estado?.toLowerCase().replace(' ', '-')}`}>
                        {mantenimiento.estado}
                      </span>
                    </div>
                    
                    <div className="mantenimiento-details">
                      <div className="mantenimiento-meta">
                        <span className="mantenimiento-fecha">
                          <CalendarIcon className="meta-icon" />
                          {formatearFecha(mantenimiento.fecha_programada)}
                        </span>
                        {mantenimiento.tecnico && (
                          <span className="mantenimiento-tecnico">
                            <UserIcon className="meta-icon" />
                            {mantenimiento.tecnico}
                          </span>
                        )}
                        {mantenimiento.costo && (
                          <span className="mantenimiento-costo">
                            <CurrencyDollarIcon className="meta-icon" />
                            {formatearMoneda(mantenimiento.costo)}
                          </span>
                        )}
                      </div>
                      
                      {mantenimiento.descripcion && (
                        <div className="mantenimiento-descripcion">
                          <p>{mantenimiento.descripcion}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-mantenimientos">
                <WrenchScrewdriverIcon className="empty-icon" />
                <h4>No hay mantenimientos registrados</h4>
                <p>Este equipo no tiene mantenimientos programados aún.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default EquipoDetail


