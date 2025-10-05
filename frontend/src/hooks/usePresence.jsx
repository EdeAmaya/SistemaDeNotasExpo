// frontend/src/hooks/usePresence.jsx
import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';

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
    
    try {
      await fetchWithCookies(`${API}/heartbeat`, {
        method: 'POST',
        body: JSON.stringify({ isActive: active })
      });
      console.log(`Heartbeat enviado - Estado: ${active ? 'ACTIVO' : 'AUSENTE'}`);
    } catch (error) {
      console.error('Error enviando heartbeat:', error);
    }
  };

  // Detectar actividad del usuario
  const handleUserActivity = () => {
    lastActivityTime.current = Date.now();
    
    if (!isUserActive) {
      console.log('👤 Usuario volvió a estar activo');
      setIsUserActive(true);
      sendHeartbeat(true);
    }
  };

  // Verificar si el usuario está inactivo
  const checkInactivity = () => {
    const now = Date.now();
    const timeSinceLastActivity = now - lastActivityTime.current;
    
    if (timeSinceLastActivity > AWAY_THRESHOLD && isUserActive) {
      console.log('Usuario marcado como ausente por inactividad');
      setIsUserActive(false);
      sendHeartbeat(false);
    }
  };

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

  return {
    isUserActive,
    sendHeartbeat
  };
};

export default usePresence;