import { useState, useCallback } from 'react';

const API_BASE_URL = 'http://localhost:4000/api';

const useProjectDetails = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [projectDetails, setProjectDetails] = useState(null);

  const fetchProjectDetails = useCallback(async (projectId) => {
    if (!projectId) {
      console.error('❌ projectId es requerido');
      setError('ID de proyecto no proporcionado');
      return null;
    }

    console.log(`🔄 Cargando detalles del proyecto ${projectId}...`);
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/evaluations/project/${projectId}`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error HTTP: ${response.status}`);
      }
      
      const result = await response.json();
      
      console.log('📦 Respuesta completa del API:', result);
      
      if (!result.success || !result.data || result.data.length === 0) {
        throw new Error('No se encontraron evaluaciones para este proyecto');
      }

      // Función para mapear cada evaluación según la estructura del backend
      const mapEvaluation = (ev) => {
        return {
          _id: ev.evaluationId,
          rubricId: {
            _id: ev.rubrica.rubricId,
            rubricName: ev.rubrica.rubricName,
            rubricType: ev.rubrica.tipoRubrica,
            stageId: {
              name: ev.rubrica.stage
            }
          },
          criteriosEvaluados: ev.criterios.map(c => ({
            criterionId: c.criterionId,
            criterionName: c.criterionName,
            puntajeObtenido: c.puntajeObtenido,
            comentario: c.comentario,
            puntajeMaximo: c.puntajeMaximo,
            peso: c.peso,
            descripcion: c.descripcion
          })),
          notaFinal: ev.notaFinal,
          tipoCalculo: ev.tipoCalculo,
          fecha: ev.fecha,
          resumen: ev.resumen
        };
      };

      // Separar por tipo usando el campo evaluacionTipo que viene del backend
      const evaluacionesInternas = result.data
        .filter(ev => ev.evaluacionTipo === 'interna')
        .map(mapEvaluation);
      
      const evaluacionesExternas = result.data
        .filter(ev => ev.evaluacionTipo === 'externa')
        .map(mapEvaluation);

      console.log('✅ Evaluaciones internas:', evaluacionesInternas);
      console.log('✅ Evaluaciones externas:', evaluacionesExternas);

      // Calcular promedios
      const calcularPromedio = (evaluaciones) => {
        if (!evaluaciones || evaluaciones.length === 0) return 0;
        const sum = evaluaciones.reduce((acc, ev) => acc + ev.notaFinal, 0);
        return sum / evaluaciones.length;
      };

      const promedioInterno = calcularPromedio(evaluacionesInternas);
      const promedioExterno = calcularPromedio(evaluacionesExternas);
      
      // Promedio total ponderado (50% interno + 50% externo)
      let promedioTotal = 0;
      if (evaluacionesInternas.length > 0 && evaluacionesExternas.length > 0) {
        promedioTotal = (promedioInterno * 0.5) + (promedioExterno * 0.5);
      } else if (evaluacionesInternas.length > 0) {
        promedioTotal = promedioInterno;
      } else if (evaluacionesExternas.length > 0) {
        promedioTotal = promedioExterno;
      }

      // Nombre del proyecto viene en cada evaluación
      const projectName = result.data[0]?.projectName || 'Proyecto sin nombre';

      const formattedData = {
        projectId,
        projectName,
        evaluacionesInternas,
        evaluacionesExternas,
        promedioInterno,
        promedioExterno,
        promedioTotal,
        totalEvaluaciones: result.count
      };

      console.log('✅ Datos finales:', formattedData);
      
      setProjectDetails(formattedData);
      return formattedData;
      
    } catch (err) {
      console.error(`❌ Error:`, err);
      setError(err.message);
      setProjectDetails(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearProjectDetails = useCallback(() => {
    setProjectDetails(null);
    setError(null);
  }, []);

  return {
    loading,
    error,
    projectDetails,
    fetchProjectDetails,
    clearProjectDetails
  };
};

export default useProjectDetails;