import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const useStages = () => {
  const [stages, setStages] = useState([]);
  const [currentStage, setCurrentStage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { fetchWithCookies, API } = useAuth();

  // Obtener todas las etapas
  const fetchStages = async () => {
    try {
      setLoading(true);
      const response = await fetchWithCookies(`${API}/stages`);
      
      if (!response.ok) {
        throw new Error('Error al obtener las etapas');
      }
      
      const data = await response.json();
      setStages(data);
      return data;
    } catch (error) {
      console.error('Error al cargar etapas:', error);
      setError(error.message);
      return [];
    }
  };

  // Obtener la etapa actual (activa)
  const fetchCurrentStage = async () => {
    try {
      const response = await fetchWithCookies(`${API}/stages/current`);
      
      if (response.ok) {
        const data = await response.json();
        // Si el backend retorna {currentStage: null}, manejarlo
        if (data.currentStage === null) {
          setCurrentStage(null);
          return null;
        }
        // Si retorna directamente la etapa
        setCurrentStage(data);
        return data;
      } else {
        // Cualquier otro error, marcar como sin etapa activa
        setCurrentStage(null);
        return null;
      }
    } catch (error) {
      console.error('Error al cargar etapa actual:', error);
      setCurrentStage(null);
      return null;
    }
  };

  // Calcular el progreso basado en la etapa actual según las fechas
  const calculateProgress = (allStages = stages) => {
    console.log('📊 Calculando progreso con etapas:', allStages);
    
    if (!allStages || allStages.length === 0) {
      console.log('❌ No hay etapas disponibles');
      return 0;
    }

    const now = new Date();
    console.log('📅 Fecha actual:', now.toISOString());
    console.log('📅 Fecha local:', now.toLocaleString('es-SV', { timeZone: 'America/El_Salvador' }));
    
    // Ordenar etapas por fecha de inicio
    const sortedStages = [...allStages].sort((a, b) => 
      new Date(a.startDate) - new Date(b.startDate)
    );

    console.log('📋 Etapas ordenadas:', sortedStages.map(s => ({
      name: s.name,
      percentage: s.percentage,
      start: s.startDate,
      end: s.endDate
    })));

    // Buscar la etapa actual (la que está dentro del rango de fechas)
    // AJUSTE: Agregar 1 día completo a la fecha de fin para cubrir todo el día
    const current = sortedStages.find(stage => {
      const start = new Date(stage.startDate);
      const end = new Date(stage.endDate);
      // Agregar 23 horas, 59 minutos, 59 segundos a la fecha de fin
      end.setHours(23, 59, 59, 999);
      
      const isInRange = now >= start && now <= end;
      
      console.log(`🔍 Verificando ${stage.name}:`, {
        start: start.toISOString(),
        end: end.toISOString(),
        now: now.toISOString(),
        isInRange
      });
      
      return isInRange;
    });

    // Si encontramos una etapa actual, retornar su porcentaje
    if (current) {
      console.log('🎯 Etapa actual encontrada:', current.name, '- Percentage:', current.percentage);
      
      // Extraer el número del campo percentage o name
      const percentageStr = (current.percentage || current.name || '').toString().trim();
      console.log('📝 String de porcentaje:', percentageStr);
      
      // Primero intentar extraer número directamente del string
      const match = percentageStr.match(/\d+/);
      if (match) {
        const value = parseInt(match[0]);
        console.log('✅ Porcentaje extraído:', value);
        return value;
      }

      // Mapeo de nombres especiales a porcentajes
      const percentageMap = {
        'Anteproyecto': 0,
        'anteproyecto': 0,
        'ANTEPROYECTO': 0,
        'Evaluación Externa': 100,
        'evaluación externa': 100,
        'Evaluacion Externa': 100,
        'evaluacion externa': 100,
        'EVALUACIÓN EXTERNA': 100,
        'EVALUACION EXTERNA': 100
      };

      // Intentar obtener del mapeo
      const mappedValue = percentageMap[percentageStr];
      if (mappedValue !== undefined) {
        console.log('✅ Porcentaje mapeado:', mappedValue);
        return mappedValue;
      }

      console.log('⚠️ No se pudo extraer porcentaje de:', percentageStr);
      return 0;
    }

    // Si no hay etapa actual, verificar si ya pasaron todas las etapas
    const lastStage = sortedStages[sortedStages.length - 1];
    if (lastStage) {
      const lastEnd = new Date(lastStage.endDate);
      lastEnd.setHours(23, 59, 59, 999);
      
      if (now > lastEnd) {
        console.log('✅ Todas las etapas completadas - 100%');
        return 100;
      }
    }

    // Si aún no ha comenzado ninguna etapa
    const firstStage = sortedStages[0];
    if (firstStage && now < new Date(firstStage.startDate)) {
      console.log('⏰ Aún no comienza ninguna etapa - 0%');
      return 0;
    }

    console.log('⚠️ Sin etapa activa - 0%');
    return 0;
  };

  // Obtener información detallada del progreso
  const getProgressDetails = (allStages = stages) => {
    if (!allStages || allStages.length === 0) {
      return {
        progress: 0,
        currentStageName: 'Sin etapas',
        currentStagePercentage: '',
        completedStages: 0,
        totalStages: 0,
        daysRemaining: 0,
        isCompleted: false
      };
    }

    const sortedStages = [...allStages].sort((a, b) => 
      new Date(a.startDate) - new Date(b.startDate)
    );

    const now = new Date();
    
    // Encontrar la etapa actual
    const current = sortedStages.find(stage => {
      const start = new Date(stage.startDate);
      const end = new Date(stage.endDate);
      return now >= start && now <= end;
    });

    // Contar etapas completadas
    const completedStages = sortedStages.filter(stage => 
      new Date(stage.endDate) < now
    ).length;

    // Verificar si todas las etapas están completadas
    const lastStage = sortedStages[sortedStages.length - 1];
    const isCompleted = now > new Date(lastStage.endDate);

    // Calcular días restantes hasta el final de la etapa actual o del proyecto
    let daysRemaining = 0;
    if (current) {
      const endDate = new Date(current.endDate);
      daysRemaining = Math.max(0, Math.ceil((endDate - now) / (1000 * 60 * 60 * 24)));
    } else if (!isCompleted && lastStage) {
      const endDate = new Date(lastStage.endDate);
      daysRemaining = Math.max(0, Math.ceil((endDate - now) / (1000 * 60 * 60 * 24)));
    }

    return {
      progress: calculateProgress(allStages),
      currentStageName: current?.name || (isCompleted ? 'Proyecto Completado' : 'Sin etapa activa'),
      currentStagePercentage: current?.percentage || '',
      completedStages,
      totalStages: sortedStages.length,
      daysRemaining,
      isCompleted
    };
  };

  // Cargar datos al montar el componente
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Cargar etapas y etapa actual en paralelo
        await Promise.all([
          fetchStages(),
          fetchCurrentStage()
        ]);
        
      } catch (error) {
        console.error('Error cargando datos de etapas:', error);
        setError('Error al cargar los datos de las etapas');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return {
    stages,
    currentStage,
    loading,
    error,
    fetchStages,
    fetchCurrentStage,
    calculateProgress: (allStages = stages) => calculateProgress(allStages),
    getProgressDetails: (allStages = stages) => getProgressDetails(allStages)
  };
};

export default useStages;