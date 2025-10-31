// Hook personalizado para obtener y gestionar actividades recientes del usuario
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext'; // Importar el hook de autenticación

const useRecentActivities = () => {
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { fetchWithCookies, API } = useAuth();

  // Función para obtener actividades recientes
  const fetchRecentActivities = async () => {
    try {
      setLoading(true);
      
      // Llamar al endpoint del backend para obtener actividades recientes
      const response = await fetchWithCookies(`${API}/user-activities/recent-activities?limit=10`);
      
      if (!response.ok) {
        throw new Error('Error al obtener actividades recientes');
      }
      
      // Parsear la respuesta JSON
      const activities = await response.json();
      setRecentActivities(activities);
      
    } catch (error) {
      console.error('Error al cargar actividades recientes:', error);
      setError(error.message);
      setRecentActivities([]);
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

  // Obtener actividades al montar el hook
  useEffect(() => {
    fetchRecentActivities();
    
    // Actualizar cada 30 segundos para actividades más frescas
    const interval = setInterval(fetchRecentActivities, 30 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  // Retornar datos y funciones del hook
  return {
    recentActivities,
    loading,
    error,
    refreshActivities: fetchRecentActivities,
    formatTimeAgo
  };
};

export default useRecentActivities;
