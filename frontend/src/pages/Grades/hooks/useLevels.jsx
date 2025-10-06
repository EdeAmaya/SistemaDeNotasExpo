import { useState, useEffect, useCallback } from 'react';

const API_URL = 'https://stc-instituto-tecnico-ricaldone.onrender.com/api';

const useLevels = () => {
  const [levels, setLevels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getLevels = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/levels`, {credentials: 'include'});
      if (!response.ok) throw new Error('Error al obtener los niveles');
      const data = await response.json();
      setLevels(data);
    } catch (err) {
      setError(err.message);
      console.error('Error en getLevels:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    getLevels();
  }, [getLevels]);

  return { levels, loading, error, getLevels };
};

export default useLevels;