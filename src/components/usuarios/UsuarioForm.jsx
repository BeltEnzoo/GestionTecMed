import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { XMarkIcon } from '@heroicons/react/24/outline'
import './UsuarioForm.css'

// Esquema de validación con Zod
const usuarioSchema = z.object({
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  nombre: z.string().min(1, 'El nombre es requerido').optional().or(z.literal('')),
  apellido: z.string().min(1, 'El apellido es requerido').optional().or(z.literal('')),
  telefono: z.string().optional().or(z.literal('')),
  departamento: z.string().optional().or(z.literal('')),
  cargo: z.string().optional().or(z.literal('')),
  rol: z.enum(['Administrador', 'Técnico', 'Invitado'], {
    errorMap: () => ({ message: 'Selecciona un rol válido' })
  }),
  estado: z.enum(['Activo', 'Inactivo', 'Suspendido'], {
    errorMap: () => ({ message: 'Selecciona un estado válido' })
  }),
  fechaIngreso: z.string().optional().or(z.literal('')),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres').optional().or(z.literal('')),
  avatarUrl: z.string().url('URL inválida').optional().or(z.literal(''))
})

const UsuarioForm = ({ 
  usuario = null, 
  onSubmit, 
  onCancel, 
  loading = false 
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue
  } = useForm({
    resolver: zodResolver(usuarioSchema),
    defaultValues: {
      email: '',
      nombre: '',
      apellido: '',
      telefono: '',
      departamento: '',
      cargo: '',
      rol: 'Técnico',
      estado: 'Activo',
      fechaIngreso: '',
      password: '',
      avatarUrl: ''
    }
  })

  // Resetear formulario cuando cambie el usuario (para edición)
  useEffect(() => {
    if (usuario) {
      reset({
        email: usuario.email || '',
        nombre: usuario.nombre || '',
        apellido: usuario.apellido || '',
        telefono: usuario.telefono || '',
        departamento: usuario.departamento || '',
        cargo: usuario.cargo || '',
        rol: usuario.rol || 'Técnico',
        estado: usuario.estado || 'Activo',
        fechaIngreso: usuario.fechaIngreso ? usuario.fechaIngreso.split('T')[0] : '',
        password: '',
        avatarUrl: usuario.avatarUrl || ''
      })
    }
  }, [usuario, reset])

  const handleFormSubmit = (data) => {
    // Limpiar campos vacíos
    const cleanedData = Object.fromEntries(
      Object.entries(data).filter(([_, value]) => value !== '')
    )
    
    onSubmit(cleanedData)
  }

  return (
    <div className="usuario-form-overlay">
      <div className="usuario-form-container">
        <div className="usuario-form-header">
          <h2 className="usuario-form-title">
            {usuario ? 'Editar Usuario' : 'Crear Nuevo Usuario'}
          </h2>
          <button 
            type="button" 
            onClick={onCancel}
            className="usuario-form-close"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="usuario-form">
          <div className="usuario-form-grid">
            {/* Información Personal */}
            <div className="usuario-form-section">
              <h3 className="usuario-form-section-title">Información Personal</h3>
              
              <div className="usuario-form-row">
                <div className="usuario-form-group">
                  <label htmlFor="email" className="usuario-form-label">
                    Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    {...register('email')}
                    className={`usuario-form-input ${errors.email ? 'error' : ''}`}
                    placeholder="usuario@hospital.com"
                  />
                  {errors.email && (
                    <span className="usuario-form-error">{errors.email.message}</span>
                  )}
                </div>

                <div className="usuario-form-group">
                  <label htmlFor="password" className="usuario-form-label">
                    Contraseña {usuario ? '(opcional)' : '*'}
                  </label>
                  <input
                    type="password"
                    id="password"
                    {...register('password')}
                    className={`usuario-form-input ${errors.password ? 'error' : ''}`}
                    placeholder="Mínimo 6 caracteres"
                  />
                  {errors.password && (
                    <span className="usuario-form-error">{errors.password.message}</span>
                  )}
                </div>
              </div>

              <div className="usuario-form-row">
                <div className="usuario-form-group">
                  <label htmlFor="nombre" className="usuario-form-label">
                    Nombre *
                  </label>
                  <input
                    type="text"
                    id="nombre"
                    {...register('nombre')}
                    className={`usuario-form-input ${errors.nombre ? 'error' : ''}`}
                    placeholder="Nombre del usuario"
                  />
                  {errors.nombre && (
                    <span className="usuario-form-error">{errors.nombre.message}</span>
                  )}
                </div>

                <div className="usuario-form-group">
                  <label htmlFor="apellido" className="usuario-form-label">
                    Apellido *
                  </label>
                  <input
                    type="text"
                    id="apellido"
                    {...register('apellido')}
                    className={`usuario-form-input ${errors.apellido ? 'error' : ''}`}
                    placeholder="Apellido del usuario"
                  />
                  {errors.apellido && (
                    <span className="usuario-form-error">{errors.apellido.message}</span>
                  )}
                </div>
              </div>

              <div className="usuario-form-row">
                <div className="usuario-form-group">
                  <label htmlFor="telefono" className="usuario-form-label">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    id="telefono"
                    {...register('telefono')}
                    className={`usuario-form-input ${errors.telefono ? 'error' : ''}`}
                    placeholder="+54 11 1234-5678"
                  />
                  {errors.telefono && (
                    <span className="usuario-form-error">{errors.telefono.message}</span>
                  )}
                </div>

                <div className="usuario-form-group">
                  <label htmlFor="avatarUrl" className="usuario-form-label">
                    URL del Avatar
                  </label>
                  <input
                    type="url"
                    id="avatarUrl"
                    {...register('avatarUrl')}
                    className={`usuario-form-input ${errors.avatarUrl ? 'error' : ''}`}
                    placeholder="https://ejemplo.com/avatar.jpg"
                  />
                  {errors.avatarUrl && (
                    <span className="usuario-form-error">{errors.avatarUrl.message}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Información Laboral */}
            <div className="usuario-form-section">
              <h3 className="usuario-form-section-title">Información Laboral</h3>
              
              <div className="usuario-form-row">
                <div className="usuario-form-group">
                  <label htmlFor="departamento" className="usuario-form-label">
                    Departamento
                  </label>
                  <input
                    type="text"
                    id="departamento"
                    {...register('departamento')}
                    className={`usuario-form-input ${errors.departamento ? 'error' : ''}`}
                    placeholder="Tecnología Médica"
                  />
                  {errors.departamento && (
                    <span className="usuario-form-error">{errors.departamento.message}</span>
                  )}
                </div>

                <div className="usuario-form-group">
                  <label htmlFor="cargo" className="usuario-form-label">
                    Cargo
                  </label>
                  <input
                    type="text"
                    id="cargo"
                    {...register('cargo')}
                    className={`usuario-form-input ${errors.cargo ? 'error' : ''}`}
                    placeholder="Técnico en Electromedicina"
                  />
                  {errors.cargo && (
                    <span className="usuario-form-error">{errors.cargo.message}</span>
                  )}
                </div>
              </div>

              <div className="usuario-form-row">
                <div className="usuario-form-group">
                  <label htmlFor="rol" className="usuario-form-label">
                    Rol *
                  </label>
                  <select
                    id="rol"
                    {...register('rol')}
                    className={`usuario-form-select ${errors.rol ? 'error' : ''}`}
                  >
                    <option value="Técnico">Técnico</option>
                    <option value="Invitado">Invitado</option>
                    <option value="Administrador">Administrador</option>
                  </select>
                  {errors.rol && (
                    <span className="usuario-form-error">{errors.rol.message}</span>
                  )}
                </div>

                <div className="usuario-form-group">
                  <label htmlFor="estado" className="usuario-form-label">
                    Estado *
                  </label>
                  <select
                    id="estado"
                    {...register('estado')}
                    className={`usuario-form-select ${errors.estado ? 'error' : ''}`}
                  >
                    <option value="Activo">Activo</option>
                    <option value="Inactivo">Inactivo</option>
                    <option value="Suspendido">Suspendido</option>
                  </select>
                  {errors.estado && (
                    <span className="usuario-form-error">{errors.estado.message}</span>
                  )}
                </div>
              </div>

              <div className="usuario-form-row">
                <div className="usuario-form-group">
                  <label htmlFor="fechaIngreso" className="usuario-form-label">
                    Fecha de Ingreso
                  </label>
                  <input
                    type="date"
                    id="fechaIngreso"
                    {...register('fechaIngreso')}
                    className={`usuario-form-input ${errors.fechaIngreso ? 'error' : ''}`}
                  />
                  {errors.fechaIngreso && (
                    <span className="usuario-form-error">{errors.fechaIngreso.message}</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="usuario-form-actions">
            <button
              type="button"
              onClick={onCancel}
              className="usuario-form-btn-cancel"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="usuario-form-btn-submit"
            >
              {loading ? 'Guardando...' : (usuario ? 'Actualizar Usuario' : 'Crear Usuario')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default UsuarioForm
