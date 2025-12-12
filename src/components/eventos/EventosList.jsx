import React, { useState, useEffect } from 'react'
import { useHistorial } from '../../hooks/useHistorial'
import EventoForm from '../reportes/EventoForm'
import { 
  PlusIcon,
  EyeIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline'
import './EventosList.css'

const EventosList = () => {
  const { eventos, cargarEventos, loading } = useHistorial()
  const [showEventoForm, setShowEventoForm] = useState(false)
  const [eventoToEdit, setEventoToEdit] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    cargarEventos()
  }, [])

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
    setShowEventoForm(false)
    setEventoToEdit(null)
  }

  const handleCloseEventoForm = () => {
    setShowEventoForm(false)
    setEventoToEdit(null)
  }

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'Registrado':
        return 'estado-registrado'
      case 'En Proceso':
        return 'estado-proceso'
      case 'Resuelto':
        return 'estado-resuelto'
      case 'Cancelado':
        return 'estado-cancelado'
      default:
        return 'estado-registrado'
    }
  }

  const getPrioridadColor = (prioridad) => {
    switch (prioridad) {
      case 'Alta':
        return 'prioridad-alta'
      case 'Media':
        return 'prioridad-media'
      case 'Baja':
        return 'prioridad-baja'
      default:
        return 'prioridad-media'
    }
  }

  const filteredEventos = eventos.filter(evento => {
    if (!searchTerm) return true
    const search = searchTerm.toLowerCase()
    return (
      evento.titulo?.toLowerCase().includes(search) ||
      evento.tipoEvento?.toLowerCase().includes(search) ||
      evento.equipos?.nombre?.toLowerCase().includes(search) ||
      evento.tecnicoResponsable?.toLowerCase().includes(search)
    )
  })

  const formatearFecha = (fecha) => {
    if (!fecha) return 'N/A'
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="eventos-container">
        <div className="eventos-loading">
          <div className="loading-spinner"></div>
          <p>Cargando eventos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="eventos-container">
      <div className="eventos-header">
        <div>
          <h1 className="eventos-title">Registro de Eventos y Fallas</h1>
          <p className="eventos-subtitle">
            Historial de eventos, fallas y observaciones de equipos médicos
          </p>
        </div>
        <button 
          onClick={handleNuevoEvento}
          className="btn-nuevo-evento"
        >
          <PlusIcon className="btn-icon-small" />
          Registrar Evento
        </button>
      </div>

      {/* Barra de búsqueda */}
      <div className="eventos-search">
        <input
          type="text"
          placeholder="Buscar eventos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="eventos-search-input"
        />
      </div>

      {/* Lista de eventos */}
      {filteredEventos.length === 0 ? (
        <div className="eventos-empty">
          <DocumentTextIcon className="h-12 w-12 text-gray-400" />
          <p>No hay eventos registrados</p>
          {searchTerm && (
            <p className="eventos-empty-subtitle">
              No se encontraron eventos que coincidan con "{searchTerm}"
            </p>
          )}
          {!searchTerm && (
            <button 
              onClick={handleNuevoEvento}
              className="btn-nuevo-evento-empty"
            >
              Registrar primer evento
            </button>
          )}
        </div>
      ) : (
        <div className="eventos-list">
          {filteredEventos.map((evento) => (
            <div key={evento.id} className="evento-card">
              <div className="evento-header">
                <div className="evento-title-section">
                  <h3 className="evento-titulo">{evento.titulo}</h3>
                  <div className="evento-meta">
                    <span className="evento-equipo">
                      {evento.equipos?.nombre || 'Equipo no especificado'}
                    </span>
                    <span className="evento-fecha">
                      {formatearFecha(evento.fechaEvento)}
                    </span>
                  </div>
                </div>
                <div className="evento-badges">
                  <span className={`badge-estado ${getEstadoColor(evento.estado)}`}>
                    {evento.estado}
                  </span>
                  <span className={`badge-prioridad ${getPrioridadColor(evento.prioridad)}`}>
                    {evento.prioridad}
                  </span>
                </div>
              </div>

              <div className="evento-body">
                <div className="evento-info">
                  <span className="evento-tipo">
                    <ExclamationTriangleIcon className="h-4 w-4" />
                    {evento.tipoEvento}
                  </span>
                  {evento.tecnicoResponsable && (
                    <span className="evento-tecnico">
                      Técnico: {evento.tecnicoResponsable}
                    </span>
                  )}
                </div>

                {evento.descripcion && (
                  <p className="evento-descripcion">{evento.descripcion}</p>
                )}

                {evento.fechaResolucion && (
                  <div className="evento-resolucion">
                    <CheckCircleIcon className="evento-resolucion-icon" />
                    <div className="evento-resolucion-content">
                      <span className="evento-resolucion-label">
                        Resuelto el: {formatearFecha(evento.fechaResolucion)}
                      </span>
                      {evento.observacionesResolucion && (
                        <p className="evento-observaciones">
                          {evento.observacionesResolucion}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {evento.costoReparacion && (
                  <div className="evento-costo">
                    <strong>Costo de reparación:</strong> ${evento.costoReparacion.toLocaleString('es-ES')}
                  </div>
                )}
              </div>

              <div className="evento-footer">
                <button
                  onClick={() => handleEditarEvento(evento)}
                  className="btn-editar-evento"
                >
                  <EyeIcon className="h-4 w-4" />
                  Editar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

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

export default EventosList

