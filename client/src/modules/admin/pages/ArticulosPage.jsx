import { useState, useEffect, useCallback } from 'react';
import { apiOwner } from '../../../api/http';

const fmt = (n) => `$${Number(n || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 })}`;

// Módulo Stock: catálogo de artículos (el precio de venta se maneja acá;
// los costos entran por Compras). Con una sucursal elegida muestra existencias.
export const ArticulosPage = () => {
    const [articulos, setArticulos] = useState([]);
    const [sucursales, setSucursales] = useState([]);
    const [branchId, setBranchId] = useState('');
    const [form, setForm] = useState({ code: '', barcode: '', name: '', category: '', salePrice: '' });
    const [editando, setEditando] = useState(null);

    const cargar = useCallback(async () => {
        const [a, b] = await Promise.all([
            apiOwner.get('/api/articles', { params: branchId ? { branchId } : {} }),
            apiOwner.get('/api/branches')
        ]);
        setArticulos(a.data.data);
        setSucursales(b.data.data);
    }, [branchId]);

    useEffect(() => { cargar().catch(console.error); }, [cargar]);

    const guardar = async (e) => {
        e.preventDefault();
        try {
            const payload = { ...form, salePrice: Number(form.salePrice) };
            if (editando) await apiOwner.put(`/api/articles/${editando}`, payload);
            else await apiOwner.post('/api/articles', payload);
            setForm({ code: '', barcode: '', name: '', category: '', salePrice: '' });
            setEditando(null);
            cargar();
        } catch (err) { alert(err.response?.data?.message || 'Error al guardar el artículo'); }
    };

    const darDeBaja = async (a) => {
        if (!window.confirm(`¿Dar de baja "${a.name}"?`)) return;
        await apiOwner.delete(`/api/articles/${a._id}`);
        cargar();
    };

    return (
        <div>
            <div className="admin-toolbar">
                <h2>Artículos</h2>
                <select value={branchId} onChange={(e) => setBranchId(e.target.value)}>
                    <option value="">Ver stock de… (elegí sucursal)</option>
                    {sucursales.map((b) => <option key={b._id} value={b._id}>{b.name}</option>)}
                </select>
            </div>

            <form className="admin-form-row" onSubmit={guardar}>
                <input placeholder="Código *" style={{ maxWidth: 110 }} value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} required />
                <input placeholder="Código de barras" style={{ maxWidth: 160 }} value={form.barcode} onChange={(e) => setForm({ ...form, barcode: e.target.value })} />
                <input placeholder="Nombre *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                <input placeholder="Categoría" style={{ maxWidth: 140 }} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
                <input placeholder="Precio venta *" type="number" step="0.01" min="0" style={{ maxWidth: 130 }} value={form.salePrice} onChange={(e) => setForm({ ...form, salePrice: e.target.value })} required />
                <button className="btn-primario">{editando ? 'Guardar' : '+ Agregar'}</button>
                {editando && (
                    <button type="button" className="btn-outline" onClick={() => { setEditando(null); setForm({ code: '', barcode: '', name: '', category: '', salePrice: '' }); }}>
                        Cancelar
                    </button>
                )}
            </form>

            <table className="admin-table">
                <thead>
                    <tr>
                        <th>Código</th><th>Barras</th><th>Nombre</th><th>Categoría</th>
                        <th className="der">Precio</th>
                        {branchId && <th className="der">Stock</th>}
                        {branchId && <th className="der">Costo prom.</th>}
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {articulos.length === 0 && <tr><td colSpan="8" className="muted centro">Catálogo vacío.</td></tr>}
                    {articulos.map((a) => (
                        <tr key={a._id}>
                            <td className="mono">{a.code}</td>
                            <td className="mono">{a.barcode || '—'}</td>
                            <td><strong>{a.name}</strong></td>
                            <td>{a.category || '—'}</td>
                            <td className="der">{fmt(a.salePrice)}</td>
                            {branchId && <td className="der">{a.stock}</td>}
                            {branchId && <td className="der">{fmt(a.avgCost)}</td>}
                            <td className="der">
                                <button className="btn-mini" onClick={() => { setEditando(a._id); setForm({ code: a.code, barcode: a.barcode || '', name: a.name, category: a.category || '', salePrice: a.salePrice }); }}>Editar</button>
                                <button className="btn-mini rojo" onClick={() => darDeBaja(a)}>Baja</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};
