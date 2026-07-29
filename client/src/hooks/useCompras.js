import { useState, useEffect, useCallback } from 'react';
import { getCompras, createCompra } from '../api/purchase.api';
import { getArticulos } from '../api/article.api';
import { getBranches } from '../api/branch.api';
import { getSuppliers, createSupplier } from '../api/supplier.api';

export function useCompras() {
    const [compras, setCompras] = useState([]);
    const [articulos, setArticulos] = useState([]);
    const [sucursales, setSucursales] = useState([]);
    const [proveedores, setProveedores] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const refresh = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const [c, a, b, p] = await Promise.all([
                getCompras(),
                getArticulos(),
                getBranches(),
                getSuppliers()
            ]);
            setCompras(c.data.data);
            setArticulos(a.data.data);
            setSucursales(b.data.data);
            setProveedores(p.data.data);
        } catch (e) {
            setError(e.response?.data?.error || 'Error al cargar compras');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { refresh(); }, [refresh]);

    const registrarCompra = async (payload) => {
        await createCompra(payload);
        await refresh();
    };

    const crearProveedor = async (payload) => {
        const r = await createSupplier(payload);
        await refresh();
        return r.data.data;
    };

    return { compras, articulos, sucursales, proveedores, loading, error, refresh, registrarCompra, crearProveedor };
}
