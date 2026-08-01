import { useState, useEffect, useCallback } from 'react';
import { getArticulos, createArticulo, updateArticulo, deleteArticulo, updateStock, getBranches } from '../api';

export function useArticulos(branchId = '') {
    const [articulos, setArticulos] = useState([]);
    const [sucursales, setSucursales] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const refresh = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const params = branchId ? { branchId } : {};
            const [a, b] = await Promise.all([getArticulos(params), getBranches()]);
            setArticulos(a.data.data);
            setSucursales(b.data.data);
        } catch (e) {
            setError(e.response?.data?.error || 'Error al cargar artículos');
        } finally {
            setLoading(false);
        }
    }, [branchId]);

    useEffect(() => { refresh(); }, [refresh]);

    const crear = async (payload) => {
        await createArticulo(payload);
        await refresh();
    };

    const editar = async (id, payload) => {
        await updateArticulo(id, payload);
        await refresh();
    };

    const darDeBaja = async (id) => {
        await deleteArticulo(id);
        await refresh();
    };

    const actualizarStock = async (id, quantity) => {
        await updateStock(id, branchId, quantity);
        await refresh();
    };

    return { articulos, sucursales, loading, error, refresh, crear, editar, darDeBaja, actualizarStock };
}
