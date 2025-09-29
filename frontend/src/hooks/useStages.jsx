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
        setCurrentStage(data);
        return data;
      } else if (response.status === 404) {
        // No hay etapa activa en este momento
        setCurrentStage(null);
        return null;
      } else {
        throw new Error('Error al obtener la etapa actual');
      }
    } catch (error) {
      console.error('Error al cargar etapa actual:', error);
      setCurrentStage(null);
      return null;
    }
  };

  // Calcular el progreso total basado en la etapa actual
  const calculateProgress = (current, allStages) => {
    if (!current || !allStages || allStages.length === 0) {
      return 0;
    }

    // Buscar la posición de la etapa actual
    const currentIndex = allStages.findIndex(stage => stage._id === current._id);
    
    if (currentIndex === -1) return 0;

    // Calcular progreso: (etapa actual / total etapas) * 100
    const progress = ((currentIndex + 1) / allStages.length) * 100;
    return Math.round(progress);
  };

  // Cargar datos al montar el componente
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Cargar etapas y etapa actual en paralelo
        const [stagesData] = await Promise.all([
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
    calculateProgress: (current = currentStage, allStages = stages) => 
      calculateProgress(current, allStages)
  };
};

export default useStages;