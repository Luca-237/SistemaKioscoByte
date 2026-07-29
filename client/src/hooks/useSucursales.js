import { useState, useEffect, useCallback } from 'react';
import { getBranches, createBranch, updateBranch, deleteBranch } from '../api/branch.api';

export function useSucursales() {
    const [sucursales, setSucursales] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const refresh = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const { data } = await getBranches();
            setSucursales(data.data);
        } catch (e) {
            setError(e.response?.data?.error || 'Error al cargar sucursales');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { refresh(); }, [refresh]);

    const crear = async (payload) => {
        await createBranch(payload);
        await refresh();
    };

    const editar = async (id, payload) => {
        await updateBranch(id, payload);
        await refresh();
    };

    const darDeBaja = async (id) => {
        await deleteBranch(id);
        await refresh();
    };

    return { sucursales, loading, error, refresh, crear, editar, darDeBaja };
}
