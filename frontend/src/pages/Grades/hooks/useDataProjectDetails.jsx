import { useState, useCallback } from 'react';

const API_URL = 'http://localhost:4000/api/project-scores';

const useProjectDetails = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [projectDetails, setProjectDetails] = useState(null);

    const fetchProjectDetails = useCallback(async (projectId) => {
        if (!projectId) {
            setError('Project ID is required');
            return null;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`${API_URL}/project/${projectId}`);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `Error HTTP: ${response.status}`);
            }

            const result = await response.json();
            const score = result.data;

            // Calcular promedios
            const notasInternas = score.evaluacionesInternas?.map(ev => ev.notaFinal || 0) || [];
            const notasExternas = score.evaluacionesExternas?.map(ev => ev.notaFinal || 0) || [];

            const todasNotas = [...notasInternas, ...notasExternas];

            // Calcular promedios internos y externos
            const promedioInterno = notasInternas.length
                ? notasInternas.reduce((a, b) => a + b, 0) / notasInternas.length
                : 0;

            const promedioExterno = notasExternas.length
                ? notasExternas.reduce((a, b) => a + b, 0) / notasExternas.length
                : 0;

            // Calcular promedio total (50% interno + 50% externo)
            let promedioTotal = 0;

            if (notasInternas.length > 0 && notasExternas.length > 0) {
                promedioTotal = (promedioInterno * 0.5) + (promedioExterno * 0.5);
            } else if (notasInternas.length > 0) {
                promedioTotal = promedioInterno;
            } else if (notasExternas.length > 0) {
                promedioTotal = promedioExterno;
            }
            const projectData = {
                _id: score._id,
                projectId: score.projectId?._id,
                projectName: score.projectId?.projectName || 'Sin nombre',
                evaluacionesInternas: score.evaluacionesInternas || [],
                evaluacionesExternas: score.evaluacionesExternas || [],
                promedioInterno,
                promedioExterno,
                promedioTotal,
                totalEvaluaciones: todasNotas.length
            };

            setProjectDetails(projectData);
            return projectData;
        } catch (err) {
            const errorMessage = err.message || 'Error al cargar detalles del proyecto';
            setError(errorMessage);
            console.error('Error fetching project details:', err);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    const clearProjectDetails = useCallback(() => {
        setProjectDetails(null);
        setError(null);
    }, []);

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    return {
        loading,
        error,
        projectDetails,
        fetchProjectDetails,
        clearProjectDetails,
        clearError
    };
};

export default useProjectDetails;