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
    <div className="min-h-screen bg-gray-200 flex items-center justify-center relative overflow-hidden">
      
      {/* ESQUINA SUPERIOR IZQUIERDA - Rectángulo amarillo */}
      <div className="absolute top-0 left-0 w-44 h-44 bg-yellow-400">
        {/* Círculo blanco con borde */}
        <div className="absolute top-16 left-12 w-10 h-10 border-4 border-white rounded-full"></div>
        {/* Círculo rojo sólido */}
        <div className="absolute top-24 left-24 w-8 h-8 bg-red-600 rounded-full"></div>
      </div>

      {/* ESQUINA SUPERIOR DERECHA - Círculo amarillo grande */}
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-yellow-400 rounded-full">
        {/* Círculo rojo-naranja con borde dentro */}
        <div className="absolute bottom-32 left-32 w-16 h-16 border-4 border-red-500 rounded-full"></div>
      </div>

      {/* ESQUINA INFERIOR IZQUIERDA - Círculo amarillo grande */}
      <div className="absolute -bottom-40 -left-40 w-[450px] h-[450px] bg-yellow-400 rounded-full"></div>

      {/* ESQUINA INFERIOR DERECHA - Rectángulo amarillo */}
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-yellow-400">
        {/* Círculo blanco con borde */}
        <div className="absolute top-24 left-24 w-20 h-20 border-4 border-white rounded-full"></div>
      </div>

      {/* BARRA ROJA DERECHA */}
      <div className="absolute top-0 right-0 w-20 h-full bg-red-500">
        {/* Tres puntos blancos verticales */}
        <div className="absolute top-40 left-6 space-y-4">
          <div className="w-3 h-3 bg-white rounded-full"></div>
          <div className="w-3 h-3 bg-white rounded-full"></div>
          <div className="w-3 h-3 bg-white rounded-full"></div>
        </div>
      </div>

      {/* CÍRCULOS DECORATIVOS DISPERSOS */}
      {/* Círculo rojo borde - izquierda medio */}
      <div className="absolute top-56 left-12 w-14 h-14 border-4 border-red-500 rounded-full"></div>
      
      {/* Círculo rojo sólido - centro izquierda */}
      <div className="absolute top-96 left-80 w-16 h-16 bg-red-600 rounded-full"></div>
      
      {/* Círculo rojo sólido - centro derecha abajo */}
      <div className="absolute bottom-48 right-96 w-20 h-20 bg-red-600 rounded-full"></div>
      
      {/* Círculo rojo borde - derecha medio */}
      <div className="absolute top-1/2 right-64 w-16 h-16 border-4 border-red-500 rounded-full"></div>

      {/* TARJETA CENTRAL */}
      <div className="relative z-10 w-full max-w-md px-4">
        <div className="bg-white rounded-3xl shadow-2xl p-12">
          
          {/* Título */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-blue-800 mb-1">TÉCNICO</h2>
            <h2 className="text-3xl font-bold text-blue-800 mb-6">CIENTÍFICO</h2>
            
            <h1 className="text-2xl font-bold text-gray-900 mb-3">
              ¡Bienvenido al Sistema de<br />Notas PTC!
            </h1>
            <p className="text-gray-600">
              Accede al Sistema con tus credenciales.
            </p>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Campo Usuario */}
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-6 py-3 border border-gray-300 rounded-full focus:outline-none focus:border-gray-400 bg-white text-gray-700 placeholder-gray-400"
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
                className="w-full px-6 py-3 pr-12 border border-gray-300 rounded-full focus:outline-none focus:border-gray-400 bg-white text-gray-700 placeholder-gray-400"
                placeholder="Contraseña"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-5 top-1/2 transform -translate-y-1/2 text-gray-500"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                </svg>
              </button>
            </div>

            {/* Botón Acceder */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 rounded-full font-bold text-white uppercase tracking-wide transition-all ${
                isLoading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-yellow-500 hover:bg-yellow-600'
              }`}
            >
              {isLoading ? 'Verificando...' : 'ACCEDER'}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-gray-600 text-sm">
          © 2024 Instituto Técnico Ricaldone
        </div>
      </div>
    </div>
  );
};

export default Login;