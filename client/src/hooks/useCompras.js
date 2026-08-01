import { useState, useEffect, useCallback } from 'react';
import {
    getCompras, createCompra, getArticulos, createArticulo, getBranches,
    getSuppliers, createSupplier, getCategories,
} from '../api';

export function useCompras() {
    const [compras, setCompras] = useState([]);
    const [articulos, setArticulos] = useState([]);
    const [sucursales, setSucursales] = useState([]);
    const [proveedores, setProveedores] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const refresh = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const [c, a, b, p, cat] = await Promise.all([
                getCompras(),
                getArticulos({ limit: 5000 }),
                getBranches(),
                getSuppliers(),
                getCategories()
            ]);
            setCompras(c.data.data);
            setArticulos(a.data.data);
            setSucursales(b.data.data);
            setProveedores(p.data.data);
            setCategorias(cat.data.data);
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

    const crearArticulo = async (payload) => {
        const r = await createArticulo(payload);
        await refresh();
        return r.data.data;
    };

    return { compras, articulos, sucursales, proveedores, categorias, loading, error, refresh, registrarCompra, crearProveedor, crearArticulo };
}
