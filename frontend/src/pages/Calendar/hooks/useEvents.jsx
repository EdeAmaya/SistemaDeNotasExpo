// Hook personalizado para manejar eventos del calendario
import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import toast from 'react-hot-toast';

const useEvents = () => {
  const [events, setEvents] = useState([]); // Lista de eventos
  const [loading, setLoading] = useState(false); // Estado de carga
  const [selectedEvent, setSelectedEvent] = useState(null); // Evento seleccionado
  const { fetchWithCookies, API } = useAuth(); // Obtener funciones de autenticación

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

      // Agregar parámetros a la URL si existen
      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      // Realizar la solicitud fetch con credenciales
      const response = await fetch(url, {
        credentials: 'include'
      });
      
      // Verificar respuesta
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
      // Realizar la solicitud fetch con credenciales
      const response = await fetch(EVENTS_API, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al crear evento');
      }

      // Parsear la respuesta JSON
      const data = await response.json();
      toast.success('Evento creado exitosamente');
      await fetchEvents();
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

      // Si se proporciona un ID de evento a excluir, agregarlo a los parámetros
      if (excludeEventId) {
        params.append('excludeEventId', excludeEventId);
      }

      // Realizar la solicitud fetch con credenciales
      const response = await fetchWithCookies(`${EVENTS_API}/check-availability?${params}`);
      
      if (!response.ok) {
        throw new Error('Error al verificar disponibilidad');
      }
      
      // Parsear la respuesta JSON
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

      // Realizar la solicitud fetch con credenciales
      const response = await fetchWithCookies(`${EVENTS_API}/occupied-dates?${params}`);
      
      if (!response.ok) {
        throw new Error('Error al obtener fechas ocupadas');
      }

      // Parsear la respuesta JSON
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

  // Retornar estado y funciones del hook
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