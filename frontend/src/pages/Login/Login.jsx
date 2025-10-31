// Página de inicio de sesión
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const Login = () => {
  useEffect(() => {
    document.title = "Iniciar Sesión | STC"; // Establecer título de la página
  }, []);

  // Estado del formulario
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [isLoading, setIsLoading] = useState(false); // Estado de carga
  const [showPassword, setShowPassword] = useState(false); // Estado para mostrar/ocultar contraseña

  const { login, isAuthenticated } = useAuth(); // Contexto de autenticación
  const navigate = useNavigate(); // Hook de navegación

  // Redirigir si ya está autenticado
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  // Manejo de cambios en el formulario
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Manejo del envío del formulario
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
    <div className="min-h-screen bg-gray-200 flex items-center justify-center relative overflow-hidden p-4">

      {/* ESQUINA SUPERIOR IZQUIERDA - Rectángulo amarillo - Responsive */}
      <div className="absolute top-0 left-0 w-24 h-24 sm:w-32 sm:h-32 lg:w-44 lg:h-44 bg-yellow-400">
        {/* Círculo blanco con borde */}
        <div className="absolute top-8 left-6 sm:top-12 sm:left-8 lg:top-16 lg:left-12 w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 border-2 sm:border-3 lg:border-4 border-white rounded-full"></div>
        {/* Círculo rojo sólido */}
        <div className="absolute top-12 left-12 sm:top-16 sm:left-16 lg:top-24 lg:left-24 w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 bg-red-600 rounded-full"></div>
      </div>

      {/* ESQUINA SUPERIOR DERECHA - Círculo amarillo grande - Responsive */}
      <div className="absolute -top-16 -right-16 sm:-top-24 sm:-right-24 lg:-top-32 lg:-right-32 w-48 h-48 sm:w-64 sm:h-64 lg:w-96 lg:h-96 bg-yellow-400 rounded-full">
        {/* Círculo rojo-naranja con borde dentro */}
        <div className="absolute bottom-16 left-16 sm:bottom-20 sm:left-20 lg:bottom-32 lg:left-32 w-8 h-8 sm:w-12 sm:h-12 lg:w-16 lg:h-16 border-2 sm:border-3 lg:border-4 border-red-500 rounded-full"></div>
      </div>

      {/* ESQUINA INFERIOR IZQUIERDA - Círculo amarillo grande - Responsive */}
      <div className="absolute -bottom-20 -left-20 sm:-bottom-32 sm:-left-32 lg:-bottom-40 lg:-left-40 w-64 h-64 sm:w-80 sm:h-80 lg:w-[450px] lg:h-[450px] bg-yellow-400 rounded-full"></div>

      {/* ESQUINA INFERIOR DERECHA - Rectángulo amarillo - Responsive */}
      <div className="absolute bottom-0 right-0 w-40 h-40 sm:w-56 sm:h-56 lg:w-80 lg:h-80 bg-yellow-400">
        {/* Círculo blanco con borde */}
        <div className="absolute top-12 left-12 sm:top-16 sm:left-16 lg:top-24 lg:left-24 w-10 h-10 sm:w-14 sm:h-14 lg:w-20 lg:h-20 border-2 sm:border-3 lg:border-4 border-white rounded-full"></div>
      </div>

      {/* BARRA ROJA DERECHA - Responsive */}
      <div className="absolute top-0 right-0 w-8 sm:w-12 lg:w-20 h-full bg-red-500">
        {/* Tres puntos blancos verticales */}
        <div className="absolute top-20 sm:top-32 lg:top-40 left-2 sm:left-4 lg:left-6 space-y-2 sm:space-y-3 lg:space-y-4">
          <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 lg:w-3 lg:h-3 bg-white rounded-full"></div>
          <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 lg:w-3 lg:h-3 bg-white rounded-full"></div>
          <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 lg:w-3 lg:h-3 bg-white rounded-full"></div>
        </div>
      </div>

      {/* CÍRCULOS DECORATIVOS DISPERSOS - Responsive */}
      {/* Círculo rojo borde - izquierda medio */}
      <div className="absolute top-32 left-6 sm:top-44 sm:left-8 lg:top-56 lg:left-12 w-8 h-8 sm:w-10 sm:h-10 lg:w-14 lg:h-14 border-2 sm:border-3 lg:border-4 border-red-500 rounded-full"></div>

      {/* Círculo rojo sólido - centro izquierda */}
      <div className="absolute top-48 left-32 sm:top-64 sm:left-48 lg:top-96 lg:left-80 w-8 h-8 sm:w-12 sm:h-12 lg:w-16 lg:h-16 bg-red-600 rounded-full"></div>

      {/* Círculo rojo sólido - centro derecha abajo */}
      <div className="absolute bottom-24 right-32 sm:bottom-32 sm:right-48 lg:bottom-48 lg:right-96 w-10 h-10 sm:w-14 sm:h-14 lg:w-20 lg:h-20 bg-red-600 rounded-full"></div>

      {/* Círculo rojo borde - derecha medio */}
      <div className="absolute top-1/2 right-24 sm:right-40 lg:right-64 w-8 h-8 sm:w-12 sm:h-12 lg:w-16 lg:h-16 border-2 sm:border-3 lg:border-4 border-red-500 rounded-full hidden sm:block"></div>

      {/* TARJETA CENTRAL - Responsive */}
      <div className="relative z-10 w-full max-w-sm sm:max-w-md px-4">
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8 lg:p-12">

          {/* Título - Responsive */}
          <div className="text-center mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-blue-800 mb-1">TÉCNICO</h2>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-blue-800 mb-4 sm:mb-6">CIENTÍFICO</h2>

            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-2 sm:mb-3">
              ¡Bienvenido al Sistema de<br />Notas PTC!
            </h1>
            <p className="text-xs sm:text-sm lg:text-base text-gray-600">
              Accede al Sistema con tus credenciales.
            </p>
          </div>

          {/* Formulario - Responsive */}
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">

            {/* Campo Usuario */}
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 sm:px-5 lg:px-6 py-2.5 sm:py-3 border border-gray-300 rounded-full focus:outline-none focus:border-gray-400 bg-white text-gray-700 placeholder-gray-400 text-sm sm:text-base transition-all"
              placeholder="Usuario"
              required
            />

            {/* Campo Contraseña */}
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 sm:px-5 lg:px-6 py-2.5 sm:py-3 pr-12 border border-gray-300 rounded-full focus:outline-none focus:border-gray-400 bg-white text-gray-700 placeholder-gray-400 text-sm sm:text-base transition-all"
                placeholder="Contraseña"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 sm:right-5 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                </svg>
              </button>
            </div>

            {/* Botón Acceder - Responsive */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-2.5 sm:py-3 rounded-full font-bold text-white uppercase tracking-wide transition-all text-sm sm:text-base ${isLoading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-yellow-500 hover:bg-yellow-600 active:scale-95'
                }`}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4 sm:h-5 sm:w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Verificando...
                </span>
              ) : (
                'ACCEDER'
              )}
            </button>
          </form>
        </div>

        {/* Footer - Responsive */}
        <div className="text-center mt-4 sm:mt-6 text-gray-600 text-xs sm:text-sm">
          © 2025 Instituto Técnico Ricaldone | Comité Técnico Científico
        </div>
      </div>
    </div>
  );
};

export default Login;