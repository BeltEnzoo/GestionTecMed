import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { user, loading } = useAuth();

  // Si está cargando, mostrar loading
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Cargando...</div>
      </div>
    );
  }

  // Si no hay usuario, redirigir al login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Si se requiere un rol específico
  if (requiredRole && user.rol !== requiredRole) {
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
          <p className="text-sm text-gray-500">
            Rol requerido: <span className="font-semibold">{requiredRole}</span>
          </p>
        </div>
      </div>
    );
  }

  // Si todo está bien, mostrar el componente
  return children;
};

export default ProtectedRoute;


