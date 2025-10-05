import { useState, useCallback } from "react";

const API_URL = "https://stc-instituto-tecnico-ricaldone.onrender.com/api/project-scores";

const useDataProjectScores = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [projectScores, setProjectScores] = useState([]);
  const [currentProjectScore, setCurrentProjectScore] = useState(null);

  // Manejo de errores centralizado
  const handleError = (error, customMessage) => {
    const errorMessage = error.message || customMessage;
    setError(errorMessage);
    console.error(customMessage, error);
  };

  // =======================
  // OPERACIONES DE SCORES
  // =======================

  // Obtener todos los project scores
  const getProjectScores = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(API_URL, { credentials: "include" });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error HTTP: ${response.status}`);
      }
      const result = await response.json();

      // Procesar los datos que vienen del backend
      const processedScores = result.data.map((score) => {
        // Usar directamente los datos que vienen del backend
        return {
          _id: score._id,
          projectId: score.projectId?._id,
          projectName: score.projectId?.projectName || "Sin nombre",
          evaluacionesInternas: score.evaluacionesInternas || [],
          evaluacionesExternas: score.evaluacionesExternas || [],
          // IMPORTANTE: Usar los promedios calculados por el backend
          promedioInterno: score.promedioInterno || 0,
          promedioExterno: score.promedioExterno || 0,
          promedioTotal: score.notaFinalGlobal || 0,
          totalEvaluaciones: score.totalEvaluaciones || 0,
          ultimaActualizacion: score.ultimaActualizacion
        };
      });

      setProjectScores(processedScores);
      return processedScores;
    } catch (error) {
      handleError(error, "Error al obtener project scores");
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Obtener un project score por ID del ProjectScore
  const getProjectScoreById = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/${id}`, { credentials: "include" });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error HTTP: ${response.status}`);
      }
      const result = await response.json();
      
      const processedScore = {
        _id: result.data._id,
        projectId: result.data.projectId?._id,
        projectName: result.data.projectId?.projectName || "Sin nombre",
        evaluacionesInternas: result.data.evaluacionesInternas || [],
        evaluacionesExternas: result.data.evaluacionesExternas || [],
        promedioInterno: result.data.promedioInterno || 0,
        promedioExterno: result.data.promedioExterno || 0,
        promedioTotal: result.data.notaFinalGlobal || 0,
        totalEvaluaciones: result.data.totalEvaluaciones || 0,
        ultimaActualizacion: result.data.ultimaActualizacion
      };
      
      setCurrentProjectScore(processedScore);
      return processedScore;
    } catch (error) {
      handleError(error, "Error al obtener el project score");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Obtener un project score por projectId
  const getProjectScoreByProjectId = useCallback(async (projectId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/project/${projectId}`, { credentials: "include" });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error HTTP: ${response.status}`);
      }
      const result = await response.json();
      
      const processedScore = {
        _id: result.data._id,
        projectId: result.data.projectId?._id,
        projectName: result.data.projectId?.projectName || "Sin nombre",
        evaluacionesInternas: result.data.evaluacionesInternas || [],
        evaluacionesExternas: result.data.evaluacionesExternas || [],
        promedioInterno: result.data.promedioInterno || 0,
        promedioExterno: result.data.promedioExterno || 0,
        promedioTotal: result.data.notaFinalGlobal || 0,
        totalEvaluaciones: result.data.totalEvaluaciones || 0,
        ultimaActualizacion: result.data.ultimaActualizacion
      };
      
      setCurrentProjectScore(processedScore);
      return processedScore;
    } catch (error) {
      handleError(error, "Error al obtener el project score por projectId");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Recalcular project score
  const recalculateProjectScore = useCallback(async (projectId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/recalculate/${projectId}`, {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error HTTP: ${response.status}`);
      }

      const result = await response.json();
      
      // Recargar todos los scores
      await getProjectScores();
      
      return result.data;
    } catch (error) {
      handleError(error, "Error al recalcular el project score");
      throw error;
    } finally {
      setLoading(false);
    }
  }, [getProjectScores]);

  // Eliminar un project score
  const deleteProjectScore = useCallback(
    async (id) => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API_URL}/${id}`, {
          method: "DELETE",
          credentials: "include",
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `Error HTTP: ${response.status}`);
        }

        const result = await response.json();
        setProjectScores((prev) => prev.filter((p) => p._id !== id));
        if (currentProjectScore?._id === id) setCurrentProjectScore(null);
        return result;
      } catch (error) {
        handleError(error, "Error al eliminar el project score");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [currentProjectScore]
  );

  // =======================
  // FUNCIONES AUXILIARES
  // =======================
  
  // Limpiar estados
  const clearError = useCallback(() => setError(null), []);
  const clearCurrentProjectScore = useCallback(
    () => setCurrentProjectScore(null),
    []
  );

  return {
    // Estados
    loading,
    error,
    projectScores,
    currentProjectScore,

    // Operaciones
    getProjectScores,
    getProjectScoreById,
    getProjectScoreByProjectId,
    recalculateProjectScore,
    deleteProjectScore,

    // Utilidades
    clearError,
    clearCurrentProjectScore,
  };
};

export default useDataProjectScores;