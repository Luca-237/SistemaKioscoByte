import { useState, useEffect, useCallback } from 'react';
import { getSummary, getMovements, getBranches } from '../api';

export function useResumen(branchId = '') {
    const [resumen, setResumen] = useState(null);
    const [movimientos, setMovimientos] = useState([]);
    const [branches, setBranches] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const refresh = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const params = branchId ? { branchId } : {};
            const [s, m, b] = await Promise.all([
                getSummary(params),
                getMovements(params),
                getBranches()
            ]);
            setResumen(s.data.data);
            setMovimientos(m.data.data);
            setBranches(b.data.data);
        } catch (e) {
            setError(e.response?.data?.error || 'Error al cargar resumen');
        } finally {
            setLoading(false);
        }
    }, [branchId]);

    useEffect(() => { refresh(); }, [refresh]);

    return { resumen, movimientos, branches, loading, error, refresh };
}
