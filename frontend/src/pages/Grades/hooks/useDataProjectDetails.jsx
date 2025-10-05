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
      const url = `${API_BASE_URL}/evaluations/project/${projectId}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Error HTTP ${response.status}`);
      }
      
      const result = await response.json();
      console.log('✅ Respuesta recibida:', result);
      
      if (!result.success || !result.data || result.data.length === 0) {
        throw new Error('No se encontraron evaluaciones');
      }

      // Función para mapear evaluaciones
      const mapEvaluation = (ev) => ({
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
          comentario: c.comentario || '',
          puntajeMaximo: c.puntajeMaximo,
          peso: c.peso,
          descripcion: c.descripcion
        })),
        notaFinal: ev.notaFinal,
        tipoCalculo: ev.tipoCalculo,
        fecha: ev.fecha,
        resumen: ev.resumen
      });

      // Clasificar evaluaciones
      const evaluacionesInternas = [];
      const evaluacionesExternas = [];

      result.data.forEach(ev => {
        const stageName = (ev.rubrica?.stage || '').toLowerCase();
        const isExternal = stageName.includes('externa') || stageName === 'evaluación externa';
        
        if (isExternal) {
          evaluacionesExternas.push(mapEvaluation(ev));
        } else {
          evaluacionesInternas.push(mapEvaluation(ev));
        }
      });

      console.log(`✅ ${evaluacionesInternas.length} internas, ${evaluacionesExternas.length} externas`);

      // Calcular promedios
      const calcularPromedio = (evaluaciones) => {
        if (!evaluaciones.length) return 0;
        return evaluaciones.reduce((sum, ev) => sum + ev.notaFinal, 0) / evaluaciones.length;
      };

      const promedioInterno = calcularPromedio(evaluacionesInternas);
      const promedioExterno = calcularPromedio(evaluacionesExternas);
      
      let promedioTotal = 0;
      if (evaluacionesInternas.length && evaluacionesExternas.length) {
        promedioTotal = (promedioInterno + promedioExterno) / 2;
      } else {
        promedioTotal = promedioInterno || promedioExterno;
      }

      const formattedData = {
        projectId,
        projectName: result.data[0].projectName,
        evaluacionesInternas,
        evaluacionesExternas,
        promedioInterno,
        promedioExterno,
        promedioTotal,
        totalEvaluaciones: result.data.length
      };

      console.log('✅ Datos listos:', formattedData);
      
      setProjectDetails(formattedData);
      setLoading(false);
      return formattedData;
      
    } catch (err) {
      console.error('❌ Error:', err);
      setError(err.message);
      setProjectDetails(null);
      setLoading(false);
      return null;
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