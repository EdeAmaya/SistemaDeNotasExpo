import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const useConnectedUsers = () => {
  const [connectedUsers, setConnectedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { fetchWithCookies, API } = useAuth();

  // Función para obtener usuarios conectados (solo logins recientes)
  const fetchConnectedUsers = async () => {
    try {
      setLoading(true);
      
      const response = await fetchWithCookies(`${API}/user-activities/connected-users?hours=2`);
      
      if (!response.ok) {
        throw new Error('Error al obtener usuarios conectados');
      }
      
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

  useEffect(() => {
    fetchConnectedUsers();
    
    // Actualizar cada 2 minutos
    const interval = setInterval(fetchConnectedUsers, 2 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  return {
    connectedUsers,
    loading,
    error,
    refreshUsers: fetchConnectedUsers,
    formatTimeAgo
  };
};

export default useConnectedUsers;
