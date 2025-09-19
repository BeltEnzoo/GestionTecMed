import React, { useState } from 'react'
import { 
  PlusIcon, 
  MagnifyingGlassIcon, 
  PencilIcon, 
  TrashIcon,
  UserIcon,
  ShieldCheckIcon,
  WrenchScrewdriverIcon,
  EyeIcon
} from '@heroicons/react/24/outline'
import { useUsuarios } from '../../hooks/useUsuarios'
import UsuarioForm from './UsuarioForm'
import './UsuariosList.css'

const UsuariosList = () => {
  const { usuarios, loading, error, createUsuario, updateUsuario, deleteUsuario } = useUsuarios()
  const [searchTerm, setSearchTerm] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingUsuario, setEditingUsuario] = useState(null)
  const [formLoading, setFormLoading] = useState(false)

  // Filtrar usuarios por término de búsqueda
  const filteredUsuarios = usuarios.filter(usuario =>
    usuario.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    usuario.apellido?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    usuario.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    usuario.departamento?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    usuario.cargo?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Manejar creación/edición de usuario
  const handleSubmit = async (usuarioData) => {
    setFormLoading(true)
    
    try {
      let result
      if (editingUsuario) {
        result = await updateUsuario(editingUsuario.id, usuarioData)
      } else {
        result = await createUsuario(usuarioData)
      }

      if (result.success) {
        setShowForm(false)
        setEditingUsuario(null)
      } else {
        alert(`Error: ${result.error}`)
      }
    } catch (error) {
      alert(`Error: ${error.message}`)
    } finally {
      setFormLoading(false)
    }
  }

  // Manejar edición de usuario
  const handleEdit = (usuario) => {
    setEditingUsuario(usuario)
    setShowForm(true)
  }

  // Manejar eliminación de usuario
  const handleDelete = async (usuario) => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar al usuario ${usuario.nombre} ${usuario.apellido}?`)) {
      const result = await deleteUsuario(usuario.id)
      if (!result.success) {
        alert(`Error al eliminar usuario: ${result.error}`)
      }
    }
  }

  // Obtener ícono según el rol
  const getRoleIcon = (rol) => {
    switch (rol) {
      case 'Administrador':
        return React.createElement(ShieldCheckIcon, { className: "h-5 w-5 text-red-500" })
      case 'Técnico':
        return React.createElement(WrenchScrewdriverIcon, { className: "h-5 w-5 text-blue-500" })
      case 'Invitado':
        return React.createElement(EyeIcon, { className: "h-5 w-5 text-green-500" })
      default:
        return React.createElement(UserIcon, { className: "h-5 w-5 text-gray-500" })
    }
  }

  // Obtener color del badge según el estado
  const getStatusBadgeClass = (estado) => {
    switch (estado) {
      case 'Activo':
        return 'status-badge status-active'
      case 'Inactivo':
        return 'status-badge status-inactive'
      case 'Suspendido':
        return 'status-badge status-suspended'
      default:
        return 'status-badge status-active'
    }
  }

  // Formatear fecha
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('es-ES')
  }

  if (loading) {
    return (
      <div className="usuarios-list">
        <div className="usuarios-loading">
          <div className="loading-spinner"></div>
          <p>Cargando usuarios...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="usuarios-list">
        <div className="usuarios-error">
          <p>Error al cargar usuarios: {error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="usuarios-list">
      {/* Header */}
      <div className="usuarios-header">
        <div className="usuarios-header-content">
          <h1 className="usuarios-title">Gestión de Usuarios</h1>
          <button 
            className="usuarios-btn-create"
            onClick={() => {
              setEditingUsuario(null)
              setShowForm(true)
            }}
          >
            {React.createElement(PlusIcon, { className: "h-5 w-5" })}
            Nuevo Usuario
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="usuarios-filters">
        <div className="usuarios-search">
          {React.createElement(MagnifyingGlassIcon, { className: "usuarios-search-icon" })}
          <input
            type="text"
            placeholder="Buscar usuarios..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="usuarios-search-input"
          />
        </div>
      </div>

      {/* Estadísticas */}
      <div className="usuarios-stats">
        <div className="stat-card">
          <div className="stat-icon">
            {React.createElement(UserIcon, { className: "h-6 w-6 text-blue-500" })}
          </div>
          <div className="stat-content">
            <p className="stat-number">{usuarios.length}</p>
            <p className="stat-label">Total Usuarios</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            {React.createElement(ShieldCheckIcon, { className: "h-6 w-6 text-green-500" })}
          </div>
          <div className="stat-content">
            <p className="stat-number">{usuarios.filter(u => u.estado === 'Activo').length}</p>
            <p className="stat-label">Activos</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            {React.createElement(WrenchScrewdriverIcon, { className: "h-6 w-6 text-orange-500" })}
          </div>
          <div className="stat-content">
            <p className="stat-number">{usuarios.filter(u => u.rol === 'Técnico').length}</p>
            <p className="stat-label">Técnicos</p>
          </div>
        </div>
      </div>

      {/* Lista de usuarios - Tabla para desktop */}
      <div className="usuarios-table-container">
        <table className="usuarios-table">
          <thead>
            <tr>
              <th>Usuario</th>
              <th>Rol</th>
              <th>Departamento</th>
              <th>Estado</th>
              <th>Último Acceso</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsuarios.length === 0 ? (
              <tr>
                <td colSpan="6" className="usuarios-empty">
                  <div className="usuarios-empty-content">
                    {React.createElement(UserIcon, { className: "h-12 w-12 text-gray-400" })}
                    <p>No se encontraron usuarios</p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredUsuarios.map((usuario) => (
                <tr key={usuario.id} className="usuarios-row">
                  <td className="usuario-info">
                    <div className="usuario-avatar">
                      {usuario.avatarUrl ? (
                        <img 
                          src={usuario.avatarUrl} 
                          alt={`${usuario.nombre} ${usuario.apellido}`}
                          className="avatar-image"
                        />
                      ) : (
                        React.createElement(UserIcon, { className: "h-6 w-6" })
                      )}
                    </div>
                    <div className="usuario-details">
                      <p className="usuario-name">
                        {usuario.nombre} {usuario.apellido}
                      </p>
                      <p className="usuario-email">{usuario.email}</p>
                      {usuario.cargo && (
                        <p className="usuario-cargo">{usuario.cargo}</p>
                      )}
                    </div>
                  </td>
                  <td className="usuario-rol">
                    <div className="rol-badge">
                      {getRoleIcon(usuario.rol)}
                      <span>{usuario.rol}</span>
                    </div>
                  </td>
                  <td className="usuario-departamento">
                    {usuario.departamento || 'N/A'}
                  </td>
                  <td className="usuario-estado">
                    <span className={getStatusBadgeClass(usuario.estado)}>
                      {usuario.estado}
                    </span>
                  </td>
                  <td className="usuario-ultimo-acceso">
                    {formatDate(usuario.ultimoAcceso)}
                  </td>
                  <td className="usuario-actions">
                    <div className="action-buttons">
                      <button 
                        className="edit-btn"
                        onClick={() => handleEdit(usuario)}
                        title="Editar usuario"
                      >
                        {React.createElement(PencilIcon, { className: "h-4 w-4" })}
                        Editar
                      </button>
                      <button 
                        className="delete-btn"
                        onClick={() => handleDelete(usuario)}
                        title="Eliminar usuario"
                      >
                        {React.createElement(TrashIcon, { className: "h-4 w-4" })}
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Lista de usuarios - Cards para móvil */}
      <div className="usuarios-mobile-cards">
        {filteredUsuarios.length === 0 ? (
          <div className="usuarios-empty">
            <div className="usuarios-empty-content">
              {React.createElement(UserIcon, { className: "h-12 w-12 text-gray-400" })}
              <p>No se encontraron usuarios</p>
            </div>
          </div>
        ) : (
          filteredUsuarios.map((usuario) => (
            <div key={usuario.id} className="usuarios-mobile-card">
              <div className="usuarios-mobile-card-header">
                <div className="usuarios-mobile-card-user">
                  <div className="usuarios-mobile-card-avatar">
                    {usuario.avatarUrl ? (
                      <img 
                        src={usuario.avatarUrl} 
                        alt={`${usuario.nombre} ${usuario.apellido}`}
                        className="avatar-image"
                      />
                    ) : (
                      React.createElement(UserIcon, { className: "h-6 w-6" })
                    )}
                  </div>
                  <div className="usuarios-mobile-card-info">
                    <p className="usuarios-mobile-card-name">
                      {usuario.nombre} {usuario.apellido}
                    </p>
                    <p className="usuarios-mobile-card-email">{usuario.email}</p>
                  </div>
                </div>
              </div>
              
              <div className="usuarios-mobile-card-body">
                <div className="usuarios-mobile-card-field">
                  <span className="usuarios-mobile-card-label">Rol</span>
                  <div className="usuarios-mobile-card-value rol-badge">
                    {getRoleIcon(usuario.rol)}
                    <span>{usuario.rol}</span>
                  </div>
                </div>
                
                <div className="usuarios-mobile-card-field">
                  <span className="usuarios-mobile-card-label">Estado</span>
                  <span className={`usuarios-mobile-card-value ${getStatusBadgeClass(usuario.estado)}`}>
                    {usuario.estado}
                  </span>
                </div>
                
                <div className="usuarios-mobile-card-field">
                  <span className="usuarios-mobile-card-label">Departamento</span>
                  <span className="usuarios-mobile-card-value">
                    {usuario.departamento || 'N/A'}
                  </span>
                </div>
                
                <div className="usuarios-mobile-card-field">
                  <span className="usuarios-mobile-card-label">Último Acceso</span>
                  <span className="usuarios-mobile-card-value">
                    {formatDate(usuario.ultimoAcceso)}
                  </span>
                </div>
              </div>
              
              <div className="usuarios-mobile-card-actions">
                <button 
                  className="edit-btn"
                  onClick={() => handleEdit(usuario)}
                  title="Editar usuario"
                >
                  {React.createElement(PencilIcon, { className: "h-4 w-4" })}
                  Editar
                </button>
                <button 
                  className="delete-btn"
                  onClick={() => handleDelete(usuario)}
                  title="Eliminar usuario"
                >
                  {React.createElement(TrashIcon, { className: "h-4 w-4" })}
                  Eliminar
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Formulario modal */}
      {showForm && (
        <UsuarioForm
          usuario={editingUsuario}
          onSubmit={handleSubmit}
          onCancel={() => {
            setShowForm(false)
            setEditingUsuario(null)
          }}
          loading={formLoading}
        />
      )}
    </div>
  )
}

export default UsuariosList
