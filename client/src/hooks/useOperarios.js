import { useState, useEffect, useCallback } from 'react';
import { getUsers, createUser, updateUser } from '../api/user.api';
import { getBranches } from '../api/branch.api';

export function useOperarios() {
    const [operarios, setOperarios] = useState([]);
    const [sucursales, setSucursales] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const refresh = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const [u, b] = await Promise.all([getUsers(), getBranches()]);
            setOperarios(u.data.data);
            setSucursales(b.data.data);
        } catch (e) {
            setError(e.response?.data?.error || 'Error al cargar operarios');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { refresh(); }, [refresh]);

    const crear = async (payload) => {
        await createUser(payload);
        await refresh();
    };

    const actualizar = async (id, payload) => {
        await updateUser(id, payload);
        await refresh();
    };

    return { operarios, sucursales, loading, error, refresh, crear, actualizar };
}
