import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redirigir si ya está autenticado
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      toast.error('Por favor completa todos los campos');
      return;
    }

    setIsLoading(true);

    try {
      const result = await login(formData.email, formData.password);
      
      if (result.success) {
        toast.success(result.message || 'Login exitoso');
        navigate('/dashboard');
      } else {
        toast.error(result.message || 'Error en el login');
      }
    } catch (error) {
      toast.error('Error de conexión');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto w-24 h-24 mb-6">
            <div className="w-full h-full rounded-full border-4 border-yellow-400 bg-gradient-to-r from-yellow-400 via-red-500 to-red-600 flex items-center justify-center relative overflow-hidden shadow-2xl">
              {/* Logo Salesianos */}
              <div className="w-16 h-16 bg-black rounded-full relative">
                <div className="absolute top-1 left-2 w-12 h-12 bg-yellow-300 rounded-full opacity-80"></div>
                <div className="absolute top-2 left-3 w-3 h-3 bg-black rounded-full"></div>
                <div className="absolute bottom-1 left-1 w-14 h-6 bg-black rounded-t-full"></div>
              </div>
            </div>
          </div>
          <h2 className="text-4xl font-black text-white mb-2">
            Salesianos Ricaldone
          </h2>
          <p className="text-blue-200 text-lg font-medium">
            Sistema de Gestión Académica
          </p>
        </div>

        {/* Formulario de Login */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 border-4 border-blue-100">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-blue-800 mb-2">Iniciar Sesión</h3>
            <div className="h-1 bg-gradient-to-r from-blue-600 via-blue-400 to-blue-600 rounded-full max-w-xs mx-auto"></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Campo Email */}
            <div>
              <label className="flex items-center space-x-2 text-blue-800 font-bold text-sm mb-2">
                <span className="bg-blue-600 text-white p-1 rounded-full text-xs">📧</span>
                <span>Correo Electrónico</span>
              </label>
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-blue-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300 text-gray-800"
                  placeholder="usuario@ricaldone.edu.sv"
                  required
                />
                <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                  <span className="text-blue-400">✉️</span>
                </div>
              </div>
            </div>

            {/* Campo Contraseña */}
            <div>
              <label className="flex items-center space-x-2 text-blue-800 font-bold text-sm mb-2">
                <span className="bg-blue-600 text-white p-1 rounded-full text-xs">🔒</span>
                <span>Contraseña</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-blue-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300 text-gray-800"
                  placeholder="Tu contraseña"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-3 flex items-center text-blue-400 hover:text-blue-600"
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {/* Botón de Login */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 px-4 rounded-xl font-bold text-lg shadow-lg transform transition-all duration-300 ${
                isLoading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 hover:scale-105 shadow-xl'
              } text-white`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Iniciando sesión...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  <span>🚀</span>
                  <span>Iniciar Sesión</span>
                </div>
              )}
            </button>
          </form>

          {/* Enlaces adicionales */}
          <div className="mt-6 text-center space-y-4">
            <div className="text-sm text-gray-600">
              ¿No tienes cuenta? Contacta al administrador
            </div>
            
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-blue-200 text-sm">
          <p>© 2024 Instituto Técnico Ricaldone - Salesianos de Don Bosco</p>
        </div>
      </div>
    </div>
  );
};

export default Login;