import { useState, useEffect, useCallback } from 'react';
import { getArticulos, createArticulo, updateArticulo, deleteArticulo, updateStock } from '../api/article.api';
import { getBranches } from '../api/branch.api';
import { getCategories, createCategory as apiCreateCat, updateCategory as apiUpdateCat, deleteCategory as apiDeleteCat } from '../api/category.api';

export function useArticulos(branchId = '') {
    const [articulos, setArticulos] = useState([]);
    const [sucursales, setSucursales] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const refresh = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const params = branchId ? { branchId } : {};
            const [a, b, c] = await Promise.all([getArticulos(params), getBranches(), getCategories()]);
            setArticulos(a.data.data);
            setSucursales(b.data.data);
            setCategorias(c.data.data);
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

    // CRUD de categorías
    const crearCategoria = async (payload) => {
        const r = await apiCreateCat(payload);
        await refresh();
        return r.data.data;
    };

    const editarCategoria = async (id, payload) => {
        await apiUpdateCat(id, payload);
        await refresh();
    };

    const eliminarCategoria = async (id) => {
        await apiDeleteCat(id);
        await refresh();
    };

    return {
        articulos, sucursales, categorias, loading, error, refresh,
        crear, editar, darDeBaja, actualizarStock,
        crearCategoria, editarCategoria, eliminarCategoria
    };
}

