// Archivo de contexto de autenticación
import React, { createContext, useContext, useState, useEffect } from "react";

// Definir la URL base de la API
const API = "https://stc-instituto-tecnico-ricaldone.onrender.com/api";
const AuthContext = createContext(); // Crear el contexto de autenticación

// Proveedor del contexto de autenticación
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Función para realizar fetch con cookies
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

  // Función para verificar el estado de autenticación
  const checkAuthStatus = async () => {
    try {
      const response = await fetchWithCookies(`${API}/auth/verify`); // Llamar al endpoint de verificación

      // Si la respuesta es exitosa, actualizar el estado de autenticación
      if (response.ok) {
        const data = await response.json();
        console.log('Usuario autenticado:', data.user);
        setUser(data.user);
        setIsAuthenticated(true);
      } else {
        console.log('No autenticado, status:', response.status);
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Error verificando autenticación:', error);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  // Función para iniciar sesión
  const login = async (email, password) => {
    try {      
      const response = await fetchWithCookies(`${API}/login`, { // Usar fetch con cookies
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Error en la autenticación");
      }

      // Actualizar el estado con la información del usuario
      setUser(data.user);
      setIsAuthenticated(true);

      setTimeout(() => {
      }, 100);

      // Retornar el resultado del login
      return { 
        success: true, 
        message: data.message,
        user: data.user,
        userType: data.userType
      };
    } catch (error) {
      console.error('Error en login:', error);
      return { 
        success: false, 
        message: error.message 
      };
    }
  };

  // Función para cerrar sesión
  const logout = async () => {
    try {
      // Llamar al endpoint de logout
      const response = await fetchWithCookies(`${API}/logout`, {
        method: "POST",
      });

      if (response.ok) {
        setUser(null);
        setIsAuthenticated(false);
        return { success: true, message: "Sesión cerrada exitosamente" };
      } else {
        throw new Error("Error al cerrar sesión");
      }
    } catch (error) {
      console.error('Error en logout:', error);
      setUser(null);
      setIsAuthenticated(false);
      return { success: false, message: error.message };
    }
  };

  // Función para registrar un nuevo usuario
  const register = async (userData) => {
    try {
      // Llamar al endpoint de registro
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

  // Verificar el estado de autenticación al cargar el componente
  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Valor del contexto
  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    logout,
    register,
    checkAuthStatus,
    fetchWithCookies, 
    API
  };

  // Renderizar el proveedor del contexto
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook personalizado para usar el contexto de autenticación
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider'); // Verificar que el hook se use dentro del proveedor
  }
  return context;
};