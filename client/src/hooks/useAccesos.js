import { useState, useEffect, useCallback } from 'react';
import { getOperadoresAcceso, getCodigosAcceso, toggleAcceso as toggleAccesoApi } from '../api';

export function useAccesos() {
    const [operarios, setOperarios] = useState([]);
    const [codigos, setCodigos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const refresh = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const [ops, cods] = await Promise.all([getOperadoresAcceso(), getCodigosAcceso()]);
            setOperarios(ops.data.data);
            setCodigos(cods.data.data);
        } catch (e) {
            setError(e.response?.data?.error || 'Error al cargar accesos');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { refresh(); }, [refresh]);

    const toggle = async (userId, code, enabled) => {
        await toggleAccesoApi(userId, code, enabled);
        await refresh();
    };

    return { operarios, codigos, loading, error, refresh, toggle };
}
