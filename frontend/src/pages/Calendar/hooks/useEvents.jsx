// frontend/src/pages/Calendar/hooks/useEvents.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import toast from 'react-hot-toast';

const useEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const { fetchWithCookies, API } = useAuth();

  // La URL base ya incluye /api, solo agregamos /events
  const EVENTS_API = `${API}/events`;

  // Obtener todos los eventos
  const fetchEvents = async (filters = {}) => {
    setLoading(true);
    try {
      let url = EVENTS_API;
      const params = new URLSearchParams();

      if (filters.month && filters.year) {
        params.append('month', filters.month);
        params.append('year', filters.year);
      } else if (filters.startDate && filters.endDate) {
        params.append('startDate', filters.startDate);
        params.append('endDate', filters.endDate);
      }

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await fetchWithCookies(url);
      
      if (!response.ok) {
        throw new Error('Error al obtener eventos');
      }
      
      const data = await response.json();
      setEvents(data);
      return data;
    } catch (error) {
      console.error('Error al cargar eventos:', error);
      toast.error('Error al cargar eventos');
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Obtener evento por ID
  const fetchEventById = async (id) => {
    try {
      const response = await fetchWithCookies(`${EVENTS_API}/${id}`);
      
      if (!response.ok) {
        throw new Error('Error al obtener evento');
      }
      
      const data = await response.json();
      setSelectedEvent(data);
      return data;
    } catch (error) {
      console.error('Error al obtener evento:', error);
      toast.error('Error al obtener evento');
      return null;
    }
  };

  // Crear nuevo evento
  const createEvent = async (eventData) => {
    try {
      console.log('Creando evento:', eventData); // Debug
      
      const response = await fetchWithCookies(EVENTS_API, {
        method: 'POST',
        body: JSON.stringify(eventData)
      });

      console.log('Respuesta del servidor:', response.status); // Debug

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error del servidor:', errorData); // Debug
        throw new Error(errorData.message || 'Error al crear evento');
      }

      const data = await response.json();
      toast.success('Evento creado exitosamente');
      await fetchEvents(); // Recargar eventos
      return { success: true, event: data.event };
    } catch (error) {
      console.error('Error al crear evento:', error);
      toast.error(error.message || 'Error al crear evento');
      return { success: false, error: error.message };
    }
  };

  // Actualizar evento
  const updateEvent = async (id, eventData) => {
    try {
      const response = await fetchWithCookies(`${EVENTS_API}/${id}`, {
        method: 'PUT',
        body: JSON.stringify(eventData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al actualizar evento');
      }

      const data = await response.json();
      toast.success('Evento actualizado exitosamente');
      await fetchEvents(); // Recargar eventos
      return { success: true, event: data.event };
    } catch (error) {
      console.error('Error al actualizar evento:', error);
      toast.error(error.message);
      return { success: false, error: error.message };
    }
  };

  // Eliminar evento
  const deleteEvent = async (id) => {
    try {
      const response = await fetchWithCookies(`${EVENTS_API}/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al eliminar evento');
      }

      toast.success('Evento eliminado exitosamente');
      await fetchEvents(); // Recargar eventos
      return { success: true };
    } catch (error) {
      console.error('Error al eliminar evento:', error);
      toast.error(error.message);
      return { success: false, error: error.message };
    }
  };

  // Verificar disponibilidad de fechas
  const checkAvailability = async (startDate, endDate, excludeEventId = null) => {
    try {
      const params = new URLSearchParams({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      });

      if (excludeEventId) {
        params.append('excludeEventId', excludeEventId);
      }

      const response = await fetchWithCookies(`${EVENTS_API}/check-availability?${params}`);
      
      if (!response.ok) {
        throw new Error('Error al verificar disponibilidad');
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error al verificar disponibilidad:', error);
      return { available: true, overlappingEvents: [] };
    }
  };

  // Obtener fechas ocupadas
  const getOccupiedDates = async (startDate, endDate) => {
    try {
      const params = new URLSearchParams({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      });

      const response = await fetchWithCookies(`${EVENTS_API}/occupied-dates?${params}`);
      
      if (!response.ok) {
        throw new Error('Error al obtener fechas ocupadas');
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error al obtener fechas ocupadas:', error);
      return [];
    }
  };

  // Cargar eventos iniciales
  useEffect(() => {
    fetchEvents();
  }, []);

  return {
    events,
    loading,
    selectedEvent,
    setSelectedEvent,
    fetchEvents,
    fetchEventById,
    createEvent,
    updateEvent,
    deleteEvent,
    checkAvailability,
    getOccupiedDates
  };
};

export default useEvents;