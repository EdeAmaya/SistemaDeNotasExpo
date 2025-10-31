// Hook personalizado para gestionar usuarios conectados y su estado de presencia
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext'; // Importar el hook de autenticación

const useConnectedUsers = () => {
  const [connectedUsers, setConnectedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { fetchWithCookies, API } = useAuth();

  // Función para obtener usuarios conectados con su estado de presencia
  const fetchConnectedUsers = async () => {
    try {
      setLoading(true);
      
      // Llamar al endpoint del backend para obtener usuarios conectados
      const response = await fetchWithCookies(`${API}/user-activities/connected-users?hours=2`);
      
      if (!response.ok) {
        throw new Error('Error al obtener usuarios conectados');
      }
      
      // Parsear la respuesta JSON
      const connectedUsers = await response.json();
      setConnectedUsers(connectedUsers);
      
    } catch (error) {
      console.error('Error al cargar usuarios conectados:', error);
      setError(error.message);
      setConnectedUsers([]);
    } finally {
      setLoading(false);
    }
  };

  // Formatear tiempo relativo
  const formatTimeAgo = (date) => {
    const now = new Date();
    const diffMs = now - new Date(date);
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Ahora mismo';
    if (diffMins < 60) return `Hace ${diffMins}m`;
    if (diffHours < 24) return `Hace ${diffHours}h`;
    if (diffDays < 7) return `Hace ${diffDays}d`;
    return 'Hace más de 1 semana';
  };

  // Obtener información del estado de presencia
  const getPresenceInfo = (presenceStatus) => {
    switch(presenceStatus) {
      case 'online':
        return {
          color: 'bg-green-500',
          label: 'En línea',
          icon: '🟢'
        };
      case 'away':
        return {
          color: 'bg-orange-500',
          label: 'Ausente',
          icon: '🟠'
        };
      case 'offline':
        return {
          color: 'bg-gray-500',
          label: 'Desconectado',
          icon: '⚫'
        };
      default:
        return {
          color: 'bg-gray-400',
          label: 'Desconocido',
          icon: '❓'
        };
    }
  };

  // Efecto para cargar usuarios conectados al montar el hook
  useEffect(() => {
    fetchConnectedUsers();
    
    // Actualizar cada 30 segundos para reflejar cambios de estado
    const interval = setInterval(fetchConnectedUsers, 30 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  // Retornar datos y funciones del hook
  return {
    connectedUsers,
    loading,
    error,
    refreshUsers: fetchConnectedUsers,
    formatTimeAgo,
    getPresenceInfo
  };
};

export default useConnectedUsers;