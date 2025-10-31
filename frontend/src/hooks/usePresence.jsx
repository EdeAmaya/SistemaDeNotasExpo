// Hook personalizado para gestionar la presencia del usuario (activo/ausente)
import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext'; // Importar el hook de autenticación

const usePresence = () => {
  const { fetchWithCookies, API, isAuthenticated } = useAuth();
  const [isUserActive, setIsUserActive] = useState(true);
  const lastActivityTime = useRef(Date.now());
  const heartbeatInterval = useRef(null);

  // Tiempo de inactividad para marcar como "ausente" (2 minutos)
  const AWAY_THRESHOLD = 2 * 60 * 1000;
  
  // Intervalo de envío de heartbeat (30 segundos)
  const HEARTBEAT_INTERVAL = 30 * 1000;

  // Enviar heartbeat al servidor
  const sendHeartbeat = async (active = true) => {
    if (!isAuthenticated) return;
    
    // Enviar el estado de actividad al backend
    try {
      await fetchWithCookies(`${API}/heartbeat`, {
        method: 'POST',
        body: JSON.stringify({ isActive: active })
      });
    } catch (error) {
      console.error('Error enviando heartbeat:', error);
    }
  };

  // Detectar actividad del usuario
  const handleUserActivity = () => {
    lastActivityTime.current = Date.now();
    
    // Si el usuario estaba ausente, marcarlo como activo
    if (!isUserActive) {
      setIsUserActive(true);
      sendHeartbeat(true);
    }
  };

  // Verificar si el usuario está inactivo
  const checkInactivity = () => {
    const now = Date.now();
    const timeSinceLastActivity = now - lastActivityTime.current;
    
    // Si ha pasado el umbral de inactividad y el usuario está marcado como activo
    if (timeSinceLastActivity > AWAY_THRESHOLD && isUserActive) {
      setIsUserActive(false);
      sendHeartbeat(false);
    }
  };

  // Configurar listeners e intervalos al montar el hook
  useEffect(() => {
    if (!isAuthenticated) return;

    // Eventos que indican actividad del usuario
    const events = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click'
    ];

    // Agregar listeners para detectar actividad
    events.forEach(event => {
      document.addEventListener(event, handleUserActivity);
    });

    // Enviar heartbeat inicial
    sendHeartbeat(true);

    // Configurar intervalo para enviar heartbeats periódicos
    heartbeatInterval.current = setInterval(() => {
      checkInactivity();
      sendHeartbeat(isUserActive);
    }, HEARTBEAT_INTERVAL);

    // Cleanup
    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleUserActivity);
      });
      
      if (heartbeatInterval.current) {
        clearInterval(heartbeatInterval.current);
      }
    };
  }, [isAuthenticated, isUserActive]);

  // Retornar el estado de actividad y la función para enviar heartbeat manualmente
  return {
    isUserActive,
    sendHeartbeat
  };
};

export default usePresence;