// Componente de ruta protegida que verifica autenticación y roles de usuario
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';

const ProtectedRoute = ({ children, requiredRoles = [] }) => {
  const { isAuthenticated, user, loading } = useAuth();

  // Mostrar loading mientras se verifica la autenticación
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-blue-400 rounded-full animate-spin animation-delay-150"></div>
          </div>
          <div className="text-white">
            <p className="text-lg font-bold">Verificando acceso...</p>
            <p className="text-blue-200 text-sm">Por favor espera un momento</p>
          </div>
        </div>
      </div>
    );
  }

  // Si no está autenticado, redirigir al login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Si se requieren roles específicos, verificar que el usuario los tenga
  if (requiredRoles.length > 0 && user) {
    const hasRequiredRole = requiredRoles.includes(user.role);
    
    if (!hasRequiredRole) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-red-900 via-red-800 to-red-900 flex items-center justify-center px-4">
          <div className="max-w-md w-full text-center space-y-6">
            <div className="bg-white p-8 rounded-2xl shadow-2xl border-4 border-red-100">
              <div className="text-6xl mb-4">🚫</div>
              <h2 className="text-2xl font-bold text-red-800 mb-4">Acceso Denegado</h2>
              <p className="text-red-600 mb-6">
                No tienes permisos para acceder a esta sección.
              </p>
              <div className="space-y-2 text-sm text-gray-600">
                <p><strong>Tu rol:</strong> {user.role}</p>
                <p><strong>Roles requeridos:</strong> {requiredRoles.join(', ')}</p>
              </div>
              <button
                onClick={() => window.history.back()}
                className="mt-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-2 rounded-lg font-bold hover:from-blue-700 hover:to-blue-800 transition-all"
              >
                Volver Atrás
              </button>
            </div>
          </div>
        </div>
      );
    }
  }

  // Si todo está bien, mostrar el contenido protegido
  return children;
};

export default ProtectedRoute;