import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useHistorial } from '../../hooks/useHistorial'
import { useEquipos } from '../../hooks/useEquipos'
import { 
  XMarkIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  WrenchScrewdriverIcon
} from '@heroicons/react/24/outline'
import './EventoForm.css'

// Esquema de validación
const eventoSchema = z.object({
  equipo: z.string().min(1, 'Debe seleccionar un equipo'),
  tipoEvento: z.string().min(1, 'Debe seleccionar un tipo de evento'),
  titulo: z.string().min(1, 'El título es obligatorio').max(255, 'El título es muy largo'),
  descripcion: z.string().optional(),
  fechaEvento: z.string().min(1, 'La fecha del evento es obligatoria'),
  prioridad: z.string().min(1, 'Debe seleccionar una prioridad'),
  estado: z.string().min(1, 'Debe seleccionar un estado'),
  tecnicoResponsable: z.string().optional(),
  costoReparacion: z.union([
    z.string(),
    z.number(),
    z.null(),
    z.undefined(),
    z.nan()
  ]).optional().transform(val => {
    if (val === '' || val === null || val === undefined || isNaN(val)) return null
    return Number(val)
  }),
  fechaResolucion: z.string().optional(),
  observacionesResolucion: z.string().optional()
})

const EventoForm = ({ evento, onClose, onSuccess }) => {
  const { crearEvento, actualizarEvento, loading } = useHistorial()
  const { equipos } = useEquipos()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch
  } = useForm({
    resolver: zodResolver(eventoSchema),
    defaultValues: {
      equipo: '',
      tipoEvento: '',
      titulo: '',
      descripcion: '',
      fechaEvento: new Date().toISOString().slice(0, 16),
      prioridad: 'Media',
      estado: 'Registrado',
      tecnicoResponsable: '',
      costoReparacion: '',
      fechaResolucion: '',
      observacionesResolucion: ''
    }
  })

  const estadoActual = watch('estado')

  // Cargar datos del evento si se está editando
  useEffect(() => {
    if (evento) {
      reset({
        equipo: evento.equipo || '',
        tipoEvento: evento.tipoEvento || '',
        titulo: evento.titulo || '',
        descripcion: evento.descripcion || '',
        fechaEvento: evento.fechaEvento ? evento.fechaEvento.slice(0, 16) : '',
        prioridad: evento.prioridad || 'Media',
        estado: evento.estado || 'Registrado',
        tecnicoResponsable: evento.tecnicoResponsable || '',
        costoReparacion: evento.costoReparacion || '',
        fechaResolucion: evento.fechaResolucion ? evento.fechaResolucion.slice(0, 16) : '',
        observacionesResolucion: evento.observacionesResolucion || ''
      })
    }
  }, [evento, reset])

  const onSubmit = async (data) => {
    setIsSubmitting(true)
    try {
      let result
      if (evento) {
        result = await actualizarEvento(evento.id, data)
      } else {
        result = await crearEvento(data)
      }

      if (result.success) {
        onSuccess && onSuccess(result.data)
        onClose()
      } else {
        console.error('Error:', result.error)
      }
    } catch (error) {
      console.error('Error al procesar el formulario:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const tiposEvento = [
    'Falla',
    'Reparación',
    'Observación',
    'Incidente',
    'Mantenimiento Preventivo',
    'Mantenimiento Correctivo',
    'Calibración',
    'Actualización',
    'Otro'
  ]

  const prioridades = [
    { value: 'Alta', label: 'Alta', color: 'red' },
    { value: 'Media', label: 'Media', color: 'yellow' },
    { value: 'Baja', label: 'Baja', color: 'green' }
  ]

  const estados = [
    'Registrado',
    'En Proceso',
    'Resuelto',
    'Cancelado'
  ]

  return (
    <div className="evento-form-overlay">
      <div className="evento-form-container">
        <div className="evento-form-header">
          <h2 className="evento-form-title">
            {evento ? 'Editar Evento' : 'Registrar Nuevo Evento'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="evento-form-close"
            aria-label="Cerrar formulario"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="evento-form">
          <div className="evento-form-grid">
            {/* Equipo */}
            <div className="form-group">
              <label htmlFor="equipo" className="form-label required">
                Equipo *
              </label>
              <select
                id="equipo"
                {...register('equipo')}
                className={`form-select ${errors.equipo ? 'error' : ''}`}
              >
                <option value="">Seleccionar equipo</option>
                {equipos.map(equipo => (
                  <option key={equipo.id} value={equipo.id}>
                    {equipo.nombre} - {equipo.codigoInterno}
                  </option>
                ))}
              </select>
              {errors.equipo && (
                <span className="form-error">{errors.equipo.message}</span>
              )}
            </div>

            {/* Tipo de Evento */}
            <div className="form-group">
              <label htmlFor="tipoEvento" className="form-label required">
                Tipo de Evento *
              </label>
              <select
                id="tipoEvento"
                {...register('tipoEvento')}
                className={`form-select ${errors.tipoEvento ? 'error' : ''}`}
              >
                <option value="">Seleccionar tipo</option>
                {tiposEvento.map(tipo => (
                  <option key={tipo} value={tipo}>{tipo}</option>
                ))}
              </select>
              {errors.tipoEvento && (
                <span className="form-error">{errors.tipoEvento.message}</span>
              )}
            </div>

            {/* Título */}
            <div className="form-group full-width">
              <label htmlFor="titulo" className="form-label required">
                Título del Evento *
              </label>
              <input
                type="text"
                id="titulo"
                {...register('titulo')}
                className={`form-input ${errors.titulo ? 'error' : ''}`}
                placeholder="Ej: Equipo no responde, Ruido anormal detectado"
              />
              {errors.titulo && (
                <span className="form-error">{errors.titulo.message}</span>
              )}
            </div>

            {/* Descripción */}
            <div className="form-group full-width">
              <label htmlFor="descripcion" className="form-label">
                Descripción Detallada
              </label>
              <textarea
                id="descripcion"
                {...register('descripcion')}
                className="form-textarea"
                rows="4"
                placeholder="Describe en detalle qué ocurrió, cuándo, cómo se detectó, etc."
              />
            </div>

            {/* Fecha del Evento */}
            <div className="form-group">
              <label htmlFor="fechaEvento" className="form-label required">
                Fecha y Hora del Evento *
              </label>
              <input
                type="datetime-local"
                id="fechaEvento"
                {...register('fechaEvento')}
                className={`form-input ${errors.fechaEvento ? 'error' : ''}`}
              />
              {errors.fechaEvento && (
                <span className="form-error">{errors.fechaEvento.message}</span>
              )}
            </div>

            {/* Prioridad */}
            <div className="form-group">
              <label htmlFor="prioridad" className="form-label required">
                Prioridad *
              </label>
              <select
                id="prioridad"
                {...register('prioridad')}
                className={`form-select ${errors.prioridad ? 'error' : ''}`}
              >
                {prioridades.map(prioridad => (
                  <option key={prioridad.value} value={prioridad.value}>
                    {prioridad.label}
                  </option>
                ))}
              </select>
              {errors.prioridad && (
                <span className="form-error">{errors.prioridad.message}</span>
              )}
            </div>

            {/* Estado */}
            <div className="form-group">
              <label htmlFor="estado" className="form-label required">
                Estado *
              </label>
              <select
                id="estado"
                {...register('estado')}
                className={`form-select ${errors.estado ? 'error' : ''}`}
              >
                {estados.map(estado => (
                  <option key={estado} value={estado}>{estado}</option>
                ))}
              </select>
              {errors.estado && (
                <span className="form-error">{errors.estado.message}</span>
              )}
            </div>

            {/* Técnico Responsable */}
            <div className="form-group">
              <label htmlFor="tecnicoResponsable" className="form-label">
                Técnico Responsable
              </label>
              <input
                type="text"
                id="tecnicoResponsable"
                {...register('tecnicoResponsable')}
                className="form-input"
                placeholder="Nombre del técnico"
              />
            </div>

            {/* Costo de Reparación */}
            <div className="form-group">
              <label htmlFor="costoReparacion" className="form-label">
                Costo de Reparación
              </label>
              <input
                type="number"
                id="costoReparacion"
                {...register('costoReparacion')}
                className="form-input"
                placeholder="0.00"
                step="0.01"
                min="0"
              />
            </div>

            {/* Fecha de Resolución - Solo si el estado es Resuelto */}
            {estadoActual === 'Resuelto' && (
              <>
                <div className="form-group">
                  <label htmlFor="fechaResolucion" className="form-label">
                    Fecha de Resolución
                  </label>
                  <input
                    type="datetime-local"
                    id="fechaResolucion"
                    {...register('fechaResolucion')}
                    className="form-input"
                  />
                </div>

                <div className="form-group full-width">
                  <label htmlFor="observacionesResolucion" className="form-label">
                    Observaciones de Resolución
                  </label>
                  <textarea
                    id="observacionesResolucion"
                    {...register('observacionesResolucion')}
                    className="form-textarea"
                    rows="3"
                    placeholder="Describe cómo se resolvió el problema"
                  />
                </div>
              </>
            )}
          </div>

          {/* Botones */}
          <div className="evento-form-actions">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={isSubmitting || loading}
            >
              {isSubmitting ? 'Guardando...' : (evento ? 'Actualizar' : 'Registrar')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EventoForm


