import { useState, useCallback } from 'react';

const API_URL = 'https://stc-instituto-tecnico-ricaldone.onrender.com/api';

const useUpdatePromedioInterno = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const updatePromedioInterno = useCallback(async (projectId, nuevoPromedioInterno) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch(`${API_URL}/project-scores/${projectId}/promedio-interno`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ nuevoPromedioInterno })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al actualizar promedio interno');
      }

      const data = await response.json();
      setSuccess(true);
      return data; 
    } catch (err) {
      setError(err.message);
      console.error('Error al actualizar promedio interno:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    success,
    updatePromedioInterno
  };
};

export default useUpdatePromedioInterno;