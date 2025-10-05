import { useState, useCallback } from 'react';

const API_URL = 'https://stc-instituto-tecnico-ricaldone.onrender.com/api/rubrics';

const useDataRubrics = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [rubrics, setRubrics] = useState([]);
  const [currentRubric, setCurrentRubric] = useState(null);

  // Manejo de errores centralizado
  const handleError = (error, customMessage) => {
    const errorMessage = error.message || customMessage;
    setError(errorMessage);
    console.error(customMessage, error);
  };

  // =====================
  // OPERACIONES DE RUBRICAS
  // =====================

  // Obtener todas las rúbricas
  const getRubrics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(API_URL, { credentials: 'include' });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error HTTP: ${response.status}`);
      }
      const data = await response.json();
      // El controlador devuelve directamente el array de rúbricas
      setRubrics(data);
      return data;
    } catch (error) {
      handleError(error, 'Error al obtener rúbricas');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Obtener una rúbrica por ID
  const getRubricById = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/${id}`, { credentials: 'include' });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error HTTP: ${response.status}`);
      }
      const data = await response.json();
      // El controlador devuelve directamente el objeto rúbrica
      setCurrentRubric(data);
      return data;
    } catch (error) {
      handleError(error, 'Error al obtener la rúbrica');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Crear una nueva rúbrica
  const createRubric = useCallback(async (rubricData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(rubricData),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error HTTP: ${response.status}`);
      }
      const data = await response.json();
      // El controlador devuelve { message: "Success", rubric: newRubric }
      setRubrics(prev => [...prev, data.rubric]);
      return data;
    } catch (error) {
      handleError(error, 'Error al crear la rúbrica');
      throw error; // Propagar el error para manejo en el componente
    } finally {
      setLoading(false);
    }
  }, []);

  // Actualizar una rúbrica
  const updateRubric = useCallback(async (id, rubricData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(rubricData),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error HTTP: ${response.status}`);
      }
      const data = await response.json();
      // El controlador devuelve { message: "Rubric updated successfully", rubric: updatedRubric }
      setRubrics(prev => prev.map(r => r._id === id ? data.rubric : r));
      setCurrentRubric(data.rubric);
      return data;
    } catch (error) {
      handleError(error, 'Error al actualizar la rúbrica');
      throw error; // Propagar el error
    } finally {
      setLoading(false);
    }
  }, []);

  // Eliminar una rúbrica
  const deleteRubric = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error HTTP: ${response.status}`);
      }
      const data = await response.json();
      // El controlador devuelve { message: "Rubric deleted successfully" }
      setRubrics(prev => prev.filter(r => r._id !== id));
      if (currentRubric?._id === id) setCurrentRubric(null);
      return data;
    } catch (error) {
      handleError(error, 'Error al eliminar la rúbrica');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [currentRubric]);

  // =====================
  // OPERACIONES DE CRITERIOS
  // =====================

  // Obtener criterios de una rúbrica
  const getCriteria = useCallback(async (rubricId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/${rubricId}/criteria`, { credentials: 'include' });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error HTTP: ${response.status}`);
      }
      const data = await response.json();
      // El controlador devuelve { success: true, data: rubric.criteria }
      return data.data || data;
    } catch (error) {
      handleError(error, 'Error al obtener criterios');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Agregar criterios a una rúbrica
  const addCriteria = useCallback(async (rubricId, criteriaData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/${rubricId}/criteria`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(criteriaData),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error HTTP: ${response.status}`);
      }
      const data = await response.json();
      // El controlador devuelve { success: true, data: rubric.criteria }
      
      if (currentRubric?._id === rubricId) {
        setCurrentRubric(prev => ({
          ...prev,
          criteria: data.data
        }));
      }
      
      return data;
    } catch (error) {
      handleError(error, 'Error al agregar criterios');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [currentRubric]);

  // Actualizar un criterio específico
  const updateCriterion = useCallback(async (rubricId, criterionId, criterionData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/${rubricId}/criteria/${criterionId}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(criterionData),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error HTTP: ${response.status}`);
      }
      const data = await response.json();
      // El controlador devuelve { success: true, data: criterion }
      
      if (currentRubric?._id === rubricId) {
        setCurrentRubric(prev => ({
          ...prev,
          criteria: prev.criteria.map(c => 
            c._id === criterionId ? data.data : c
          )
        }));
      }
      
      return data;
    } catch (error) {
      handleError(error, 'Error al actualizar el criterio');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [currentRubric]);

  // Eliminar un criterio
  const deleteCriterion = useCallback(async (rubricId, criterionId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/${rubricId}/criteria/${criterionId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error HTTP: ${response.status}`);
      }
      const data = await response.json();
      // El controlador devuelve { success: true, message: "Criterion deleted successfully" }
      
      if (currentRubric?._id === rubricId) {
        setCurrentRubric(prev => ({
          ...prev,
          criteria: prev.criteria.filter(c => c._id !== criterionId)
        }));
      }
      
      return data;
    } catch (error) {
      handleError(error, 'Error al eliminar el criterio');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [currentRubric]);

  // =====================
  // UTILIDADES
  // =====================

  const clearError = useCallback(() => setError(null), []);
  const clearCurrentRubric = useCallback(() => setCurrentRubric(null), []);

  return {
    // Estados
    loading,
    error,
    rubrics,
    currentRubric,
    
    // Operaciones de rúbricas
    getRubrics,
    getRubricById,
    createRubric,
    updateRubric,
    deleteRubric,
    
    // Operaciones de criterios
    getCriteria,
    addCriteria,
    updateCriterion,
    deleteCriterion,
    
    // Utilidades
    clearError,
    clearCurrentRubric,
  };
};

export default useDataRubrics;