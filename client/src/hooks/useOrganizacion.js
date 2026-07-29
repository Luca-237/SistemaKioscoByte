import { useState, useEffect, useCallback } from 'react';
import { getOrganizacion, bootstrapOrganizacion } from '../api/organization.api';

export function useOrganizacion() {
    const [org, setOrg] = useState(undefined); // undefined = cargando, null = sin org
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const refresh = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const { data } = await getOrganizacion();
            setOrg(data.org);
        } catch (e) {
            setOrg(null);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { refresh(); }, [refresh]);

    const crear = async (name, taxId) => {
        setError(null);
        await bootstrapOrganizacion(name, taxId);
        await refresh();
    };

    return { org, loading, error, refresh, crear };
}
