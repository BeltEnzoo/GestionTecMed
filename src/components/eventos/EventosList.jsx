import React, { useState, useEffect } from 'react'
import { useHistorial } from '../../hooks/useHistorial'
import { useAuth } from '../../hooks/useAuth'
import EventoForm from '../reportes/EventoForm'
import {
  PlusIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline'
import './EventosList.css'

function formatCosto(valor) {
  const numero = Number(valor)
  if (!valor || Number.isNaN(numero) || numero <= 0) return null
  return `$${numero.toLocaleString('es-AR')}`
}

const EventoDetalle = ({ evento, formatearFecha, onClose, onEdit }) => {
  const costo = formatCosto(evento.costoReparacion)
  const filas = [
    ['Equipo', evento.equipos?.nombre || 'Sin equipo'],
    ['Tipo', evento.tipoEvento || '-'],
    ['Prioridad', evento.prioridad || '-'],
    ['Estado', evento.estado || '-'],
    ['Fecha', formatearFecha(evento.fechaEvento)],
    ['Técnico', evento.tecnicoResponsable || '-'],
    ['Descripción', evento.descripcion || '-'],
    ['Resuelto', evento.fechaResolucion ? formatearFecha(evento.fechaResolucion) : '-'],
    ['Observaciones', evento.observacionesResolucion || '-'],
  ]
  if (costo) filas.push(['Costo de reparación', costo])

  return (
    <div className="detalle-overlay" onClick={onClose}>
      <div className="detalle-panel" onClick={(e) => e.stopPropagation()}>
        <div className="detalle-header">
          <h2>{evento.titulo}</h2>
          <button className="close-btn" type="button" onClick={onClose} aria-label="Cerrar">×</button>
        </div>
        <dl className="detalle-list">
          {filas.map(([label, value]) => (
            <div key={label} className="detalle-row">
              <dt>{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
        {onEdit && (
          <div className="detalle-actions">
            <button type="button" className="btn-editar-evento" onClick={onEdit}>
              Editar
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

const EventosList = () => {
  const { eventos, cargarEventos, loading } = useHistorial()
  const { user } = useAuth()
  const canWrite = user?.rol !== 'Invitado'
  const [showEventoForm, setShowEventoForm] = useState(false)
  const [eventoToEdit, setEventoToEdit] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [detalle, setDetalle] = useState(null)

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
        {canWrite && (
          <button 
            onClick={handleNuevoEvento}
            className="btn-nuevo-evento"
          >
            <PlusIcon className="btn-icon-small" />
            Registrar Evento
          </button>
        )}
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
          <DocumentTextIcon className="h-10 w-10" aria-hidden />
          <p>No hay eventos registrados</p>
          {searchTerm && (
            <p className="eventos-empty-subtitle">
              No se encontraron eventos que coincidan con "{searchTerm}"
            </p>
          )}
          {!searchTerm && canWrite && (
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
            <article key={evento.id} className="evento-card">
              <div className="evento-row">
                <div className="evento-main">
                  <h3 className="evento-titulo">{evento.titulo}</h3>
                  <p className="evento-meta">
                    <span>{evento.equipos?.nombre || 'Sin equipo'}</span>
                    <span>{evento.tipoEvento}</span>
                    <span>{formatearFecha(evento.fechaEvento)}</span>
                  </p>
                </div>
                <span className={`badge-estado ${getEstadoColor(evento.estado)}`}>
                  {evento.estado}
                </span>
                {evento.prioridad === 'Alta' && (
                  <span className={`badge-prioridad ${getPrioridadColor(evento.prioridad)}`}>
                    Alta
                  </span>
                )}
                <button
                  type="button"
                  className="btn-detalle-evento"
                  onClick={() => setDetalle(evento)}
                >
                  Detalles
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Formulario de Evento */}
      {detalle && (
        <EventoDetalle
          evento={detalle}
          formatearFecha={formatearFecha}
          onClose={() => setDetalle(null)}
          onEdit={canWrite ? () => {
            const actual = detalle
            setDetalle(null)
            handleEditarEvento(actual)
          } : null}
        />
      )}

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

