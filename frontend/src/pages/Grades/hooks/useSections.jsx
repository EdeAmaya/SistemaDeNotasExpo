import { useState, useEffect, useCallback } from 'react';

const API_URL = 'https://stc-instituto-tecnico-ricaldone.onrender.com/api';

const useSections = () => {
    const [sections, setSections] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const getSections = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_URL}/sections`, {credentials: 'include'});
            if (!response.ok) throw new Error('Error al obtener las secciones');
            const data = await response.json();
            setSections(data);
        } catch (err) {
            setError(err.message);
            console.error('Error en getSections:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        getSections();
    }, [getSections]);

    return { sections, loading, error, getSections };
};

export default useSections;