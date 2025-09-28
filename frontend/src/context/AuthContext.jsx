import React, { createContext, useContext, useState, useEffect } from "react";

const API = "http://localhost:4000/api";
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Configuración base para fetch con cookies
  const fetchWithCookies = (url, options = {}) => {
    return fetch(url, {
      ...options,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
  };

  // Verificar el estado de autenticación al cargar la app
  const checkAuthStatus = async () => {
    try {
      console.log('🔍 Verificando estado de autenticación...');
      
      const response = await fetchWithCookies(`${API}/auth/verify`);

      console.log('📡 Respuesta de verificación:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Usuario autenticado:', data.user);
        setUser(data.user);
        setIsAuthenticated(true);
      } else {
        console.log('❌ No autenticado, status:', response.status);
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('❌ Error verificando autenticación:', error);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  // Login function
  const login = async (email, password) => {
    try {
      console.log('🚀 Intentando login para:', email);
      
      const response = await fetchWithCookies(`${API}/login`, {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      console.log('📡 Respuesta de login:', response.status);
      
      // Verificar headers de respuesta
      console.log('📨 Headers de respuesta:', Object.fromEntries(response.headers.entries()));

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Error en la autenticación");
      }

      console.log('✅ Login exitoso:', data.user);

      // Actualizar el estado con la información del usuario
      setUser(data.user);
      setIsAuthenticated(true);

      // Verificar inmediatamente si las cookies se establecieron
      setTimeout(() => {
        console.log('🍪 Cookies después del login:', document.cookie);
      }, 100);

      return { 
        success: true, 
        message: data.message,
        user: data.user,
        userType: data.userType
      };
    } catch (error) {
      console.error('❌ Error en login:', error);
      return { 
        success: false, 
        message: error.message 
      };
    }
  };

  // Logout function
  const logout = async () => {
    try {
      console.log('🚪 Cerrando sesión...');
      
      const response = await fetchWithCookies(`${API}/logout`, {
        method: "POST",
      });

      if (response.ok) {
        setUser(null);
        setIsAuthenticated(false);
        console.log('✅ Logout exitoso');
        return { success: true, message: "Sesión cerrada exitosamente" };
      } else {
        throw new Error("Error al cerrar sesión");
      }
    } catch (error) {
      console.error('❌ Error en logout:', error);
      // Incluso si hay error, limpiar el estado local
      setUser(null);
      setIsAuthenticated(false);
      return { success: false, message: error.message };
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      const response = await fetchWithCookies(`${API}/register`, {
        method: "POST",
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Error en el registro");
      }

      return {
        success: true,
        message: data.message,
        user: data.user
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  };

  // Verificar autenticación al montar el componente
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    logout,
    register,
    checkAuthStatus,
    fetchWithCookies, // Exponer la función para uso en hooks
    API
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
};