// frontend/src/navigation/Navigation.jsx
import React from "react";
import { Route, Routes } from "react-router-dom";

// Componentes de autenticación
import ProtectedRoute from "../pages/Login/components/ProtectedRoute";

// Páginas
import Dashboard from "../pages/Dashboard/Dashboard";
import Users from "../pages/Users/Users";
import Students from "../pages/Students/Students";
import Projects from "../pages/Projects/Projects";
import Evaluations from "../pages/Evaluations/Evaluations";
import Grades from "../pages/Grades/Grades";
import Calendar from "../pages/Calendar/Calendar"; // ← NUEVA IMPORTACIÓN
import Login from "../pages/Login/Login";

// Navegación
import NavBar from "./Sidebar";

// Context
import { useAuth } from "../context/AuthContext";

function Navigation() {
  const { isAuthenticated, loading } = useAuth();

  // Mostrar loading mientras se verifica la autenticación
  if (loading) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="relative flex items-center justify-center">
            {/* Spinner principal */}
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>

            {/* Spinner interno (centrado encima) */}
            <div className="absolute w-10 h-10 border-4 border-transparent border-r-blue-400 rounded-full animate-spin animation-delay-150"></div>
          </div>

          <div className="text-white">
            <p className="text-lg font-bold">Cargando aplicación...</p>
            <p className="text-blue-200 text-sm">Por favor espera un momento</p>
          </div>
        </div>
      </div>
    );
  }

  // Si no está autenticado, mostrar solo el login
  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Login />} />
      </Routes>
    );
  }

  // Si está autenticado, mostrar la aplicación completa
  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      <NavBar />
      <div className="flex-1 overflow-y-auto w-full">
        <Routes>
          {/* Rutas base - disponibles para todos los usuarios autenticados */}
          <Route path="/" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />

          {/* Ruta de Calendario - Todos los usuarios autenticados */}
          <Route path="/calendar" element={
            <ProtectedRoute>
              <Calendar />
            </ProtectedRoute>
          } />

          {/* Rutas administrativas - Solo para Admin */}
          <Route path="/users" element={
            <ProtectedRoute requiredRoles={['Admin']}>
              <Users />
            </ProtectedRoute>
          } />

          {/* Rutas de gestión académica - Admin y Docente */}
          <Route path="/students" element={
            <ProtectedRoute requiredRoles={['Admin', 'Docente']}>
              <Students />
            </ProtectedRoute>
          } />

          {/* Rutas de proyectos - Admin, Docente y Evaluador */}
          <Route path="/projects" element={
            <ProtectedRoute requiredRoles={['Admin', 'Docente', 'Evaluador']}>
              <Projects />
            </ProtectedRoute>
          } />

          {/* Rutas de evaluaciones - Admin, Docente y Evaluador */}
          <Route path="/evaluations" element={
            <ProtectedRoute requiredRoles={['Admin', 'Docente', 'Evaluador']}>
              <Evaluations />
            </ProtectedRoute>
          } />

          {/* Rutas de notas - Admin, Docente y Evaluador */}
          <Route path="/grades" element={
            <ProtectedRoute requiredRoles={['Admin', 'Docente', 'Evaluador']}>
              <Grades />
            </ProtectedRoute>
          } />

          {/* Ruta para manejar rutas no encontradas */}
          <Route path="*" element={
            <ProtectedRoute>
              <div className="min-h-full bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center px-4">
                <div className="max-w-md w-full text-center space-y-6">
                  <div className="bg-white p-8 rounded-2xl shadow-2xl border-4 border-blue-100">
                    <div className="text-6xl mb-4">🔍</div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Página No Encontrada</h2>
                    <p className="text-gray-600 mb-6">
                      La página que buscas no existe o fue movida.
                    </p>
                    <button
                      onClick={() => window.location.href = '/dashboard'}
                      className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-2 rounded-lg font-bold hover:from-blue-700 hover:to-blue-800 transition-all"
                    >
                      Ir al Dashboard
                    </button>
                  </div>
                </div>
              </div>
            </ProtectedRoute>
          } />
        </Routes>
      </div>
    </div>
  );
}

export default Navigation;