import { useState, useEffect, useCallback } from 'react';

const API_URL = 'https://stc-instituto-tecnico-ricaldone.onrender.com/api';

const useSpecialties = () => {
    const [specialties, setSpecialties] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const getSpecialties = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_URL}/specialties`);
            if (!response.ok) throw new Error('Error al obtener las especialidades');
            const data = await response.json();
            setSpecialties(data);
        } catch (err) {
            setError(err.message);
            console.error('Error en getSpecialties:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        getSpecialties();
    }, [getSpecialties]);

    return { specialties, loading, error, getSpecialties };
};

export default useSpecialties;