import { useState, useEffect, useCallback } from 'react';
import { getAnalytics } from '../api/stats.api';
import { getBranches } from '../api/branch.api';

export function useEstadisticas(branchId = '') {
    const [stats, setStats] = useState(null);
    const [branches, setBranches] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const refresh = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const params = branchId ? { branchId } : {};
            const [resStats, resBranches] = await Promise.all([getAnalytics(params), getBranches()]);
            setStats(resStats.data.data);
            setBranches(resBranches.data.data || []);
        } catch (e) {
            setError(e.response?.data?.error || 'Error al cargar estadísticas');
        } finally {
            setLoading(false);
        }
    }, [branchId]);

    useEffect(() => { refresh(); }, [refresh]);

    return { stats, branches, loading, error, refresh };
}
