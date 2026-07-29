import { useState, useEffect, useCallback } from 'react';
import { getCashSessions, getCashSessionSales } from '../api/stats.api';

export function useCajas() {
    const [cajas, setCajas] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const refresh = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const { data } = await getCashSessions();
            setCajas(data.data);
        } catch (e) {
            setError(e.response?.data?.error || 'Error al cargar cajas');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { refresh(); }, [refresh]);

    // Carga las ventas de una sesión específica. Devuelve la data directamente
    // (se maneja localmente en el modal de detalle).
    const getSalesForSession = async (sessionId) => {
        const { data } = await getCashSessionSales(sessionId);
        return data.data;
    };

    return { cajas, loading, error, refresh, getSalesForSession };
}
