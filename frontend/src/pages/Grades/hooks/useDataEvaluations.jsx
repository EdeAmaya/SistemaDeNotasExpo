import { useState, useCallback } from 'react';

const API_URL = 'https://stc-instituto-tecnico-ricaldone.onrender.com/api/evaluations';

const useDataEvaluations = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [evaluations, setEvaluations] = useState([]);
  const [currentEvaluation, setCurrentEvaluation] = useState(null);

  // Manejo de errores centralizado
  const handleError = (error, customMessage) => {
    const errorMessage = error.message || customMessage;
    setError(errorMessage);
    console.error(customMessage, error);
  };

  // =====================
  // OPERACIONES DE EVALUACIONES
  // =====================

  // Obtener todas las evaluaciones
  const getEvaluations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(API_URL);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error HTTP: ${response.status}`);
      }
      const result = await response.json();
      setEvaluations(result.data || []);
      return result.data;
    } catch (error) {
      handleError(error, 'Error al obtener evaluaciones');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Obtener una evaluación por ID
  const getEvaluationById = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/${id}`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error HTTP: ${response.status}`);
      }
      const result = await response.json();
      setCurrentEvaluation(result.data);
      return result.data;
    } catch (error) {
      handleError(error, 'Error al obtener la evaluación');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Crear una nueva evaluación
  const createEvaluation = useCallback(async (evaluationData) => {
    setLoading(true);
    setError(null);
    try {
      // Validar y formatear los datos antes de enviar
      const formattedData = {
        ...evaluationData,
        criteriosEvaluados: evaluationData.criteriosEvaluados?.map(criterio => ({
          criterioId: criterio.criterioId || criterio._id, // Asegurar que existe criterioId
          puntajeObtenido: Number(criterio.puntajeObtenido) || 0,
          comentario: criterio.comentario || ''
        }))
      };

      console.log('📤 Datos a enviar:', JSON.stringify(formattedData, null, 2));

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formattedData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Error del servidor:', errorData);
        throw new Error(errorData.message || `Error HTTP: ${response.status}`);
      }

      const result = await response.json();
      setEvaluations(prev => [...prev, result.data]);
      return result.data;
    } catch (error) {
      console.error('Error completo:', error);
      handleError(error, 'Error al crear la evaluación');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Actualizar una evaluación
  const updateEvaluation = useCallback(async (id, evaluationData) => {
    setLoading(true);
    setError(null);
    try {
      // Formatear los datos antes de actualizar
      const formattedData = {
        ...evaluationData,
        criteriosEvaluados: evaluationData.criteriosEvaluados?.map(criterio => ({
          criterioId: criterio.criterioId || criterio._id,
          puntajeObtenido: Number(criterio.puntajeObtenido) || 0,
          comentario: criterio.comentario || ''
        }))
      };

      const response = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formattedData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error HTTP: ${response.status}`);
      }

      const result = await response.json();
      setEvaluations(prev => prev.map(e => e._id === id ? result.data : e));
      setCurrentEvaluation(result.data);
      return result.data;
    } catch (error) {
      handleError(error, 'Error al actualizar la evaluación');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Eliminar una evaluación
  const deleteEvaluation = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error HTTP: ${response.status}`);
      }

      const result = await response.json();
      setEvaluations(prev => prev.filter(e => e._id !== id));
      if (currentEvaluation?._id === id) setCurrentEvaluation(null);
      return result;
    } catch (error) {
      handleError(error, 'Error al eliminar la evaluación');
      return null;
    } finally {
      setLoading(false);
    }
  }, [currentEvaluation]);

  // =====================
  // FUNCIONES AUXILIARES
  // =====================

  // Calcular nota total de una evaluación
  const calculateTotalScore = useCallback((evaluation) => {
    if (!evaluation?.criteriosEvaluados || evaluation.criteriosEvaluados.length === 0) {
      return 0;
    }
    return evaluation.criteriosEvaluados.reduce((sum, criterio) => {
      return sum + (criterio.puntajeObtenido || 0);
    }, 0);
  }, []);

  // Obtener evaluaciones por proyecto
  const getEvaluationsByProject = useCallback((projectId) => {
    return evaluations.filter(e => e.projectId?._id === projectId || e.projectId === projectId);
  }, [evaluations]);

  // Obtener evaluaciones por rúbrica
  const getEvaluationsByRubric = useCallback((rubricId) => {
    return evaluations.filter(e => e.rubricId?._id === rubricId || e.rubricId === rubricId);
  }, [evaluations]);

  // Limpiar estados
  const clearError = useCallback(() => setError(null), []);
  const clearCurrentEvaluation = useCallback(() => setCurrentEvaluation(null), []);

  return {
    // Estados
    loading,
    error,
    evaluations,
    currentEvaluation,
    
    // Operaciones CRUD
    getEvaluations,
    getEvaluationById,
    createEvaluation,
    updateEvaluation,
    deleteEvaluation,
    
    // Funciones auxiliares
    calculateTotalScore,
    getEvaluationsByProject,
    getEvaluationsByRubric,
    
    // Utilidades
    clearError,
    clearCurrentEvaluation,
  };
};

export default useDataEvaluations;