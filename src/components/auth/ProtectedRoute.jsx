import React from 'react'
import { useAuth } from '../../hooks/useAuth'
import { Navigate } from 'react-router-dom'

const ProtectedRoute = ({ children, requiredRole = null, requireManageUsers = false }) => {
  const { user, loading, canManageUsers } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Cargando...</div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (requireManageUsers && !canManageUsers) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Acceso Denegado</h1>
          <p className="text-gray-600 mb-4">
            No tienes permisos para gestionar usuarios.
          </p>
        </div>
      </div>
    )
  }

  if (requiredRole) {
    const allowed =
      user.rol === requiredRole ||
      (requiredRole === 'Administrador' && user.rol === 'Superusuario')
    if (!allowed) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Acceso Denegado</h1>
            <p className="text-gray-600 mb-4">
              No tienes permisos para acceder a esta sección.
            </p>
            <p className="text-sm text-gray-500">
              Tu rol actual: <span className="font-semibold">{user.rol}</span>
            </p>
          </div>
        </div>
      )
    }
  }

  return children
}

export default ProtectedRoute
