import { useState, useEffect, useCallback } from 'react';
import { apiOwner } from '../../../api/http';

const fmt = (n) => `$${Number(n || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 })}`;

// Módulo Stock: catálogo de artículos (el precio de venta se maneja acá;
// los costos entran por Compras). Con una sucursal elegida muestra existencias.
export const ArticulosPage = () => {
    const [articulos, setArticulos] = useState([]);
    const [sucursales, setSucursales] = useState([]);
    const [branchId, setBranchId] = useState('');
    const [form, setForm] = useState({ code: '', barcode: '', name: '', category: '', salePrice: '', imageUrl: '' });
    const [editando, setEditando] = useState(null);
    const [buscandoOFF, setBuscandoOFF] = useState(false);
    const [editingStock, setEditingStock] = useState({});  // { [articleId]: newQty }

    const cargar = useCallback(async () => {
        const [a, b] = await Promise.all([
            apiOwner.get('/api/articles', { params: branchId ? { branchId } : {} }),
            apiOwner.get('/api/branches')
        ]);
        setArticulos(a.data.data);
        setSucursales(b.data.data);
    }, [branchId]);

    useEffect(() => { cargar().catch(console.error); }, [cargar]);

    const buscarEnOFF = async (barcode) => {
        if (!barcode || barcode.length < 8) return;
        setBuscandoOFF(true);
        try {
            const res = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);
            const data = await res.json();
            if (data.status === 1 && data.product) {
                const p = data.product;
                setForm(prev => ({
                    ...prev,
                    name: prev.name || p.product_name_es || p.product_name || '',
                    category: prev.category || (p.categories ? p.categories.split(',')[0].trim() : ''),
                    imageUrl: prev.imageUrl || p.image_url || p.image_front_url || ''
                }));
            }
        } catch (err) {
            console.error('Error fetching from OFF:', err);
        } finally {
            setBuscandoOFF(false);
        }
    };

    const guardar = async (e) => {
        e.preventDefault();
        try {
            const payload = { ...form, salePrice: Number(form.salePrice) };
            if (editando) await apiOwner.put(`/api/articles/${editando}`, payload);
            else await apiOwner.post('/api/articles', payload);
            setForm({ code: '', barcode: '', name: '', category: '', salePrice: '', imageUrl: '' });
            setEditando(null);
            cargar();
        } catch (err) { alert(err.response?.data?.message || 'Error al guardar el artículo'); }
    };

    const darDeBaja = async (a) => {
        if (!window.confirm(`¿Dar de baja "${a.name}"?`)) return;
        await apiOwner.delete(`/api/articles/${a._id}`);
        cargar();
    };

    const actualizarStock = async (articleId) => {
        const qty = editingStock[articleId];
        if (qty === undefined || qty === '') return;
        try {
            await apiOwner.patch(`/api/articles/${articleId}/stock`, { branchId, quantity: Number(qty) });
            setEditingStock(prev => { const n = { ...prev }; delete n[articleId]; return n; });
            cargar();
        } catch (err) {
            alert(err.response?.data?.message || 'Error al actualizar stock');
        }
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

            <form className="admin-form-row" onSubmit={guardar} style={{ alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <input placeholder="Código *" style={{ maxWidth: 110 }} value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} required />
                        <input placeholder="Código de barras" style={{ maxWidth: 160 }} value={form.barcode} onChange={(e) => setForm({ ...form, barcode: e.target.value })} onBlur={(e) => buscarEnOFF(e.target.value)} />
                        <input placeholder="Nombre *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                        <input placeholder="Categoría" style={{ maxWidth: 140 }} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
                        <input placeholder="Precio venta *" type="number" step="0.01" min="0" style={{ maxWidth: 130 }} value={form.salePrice} onChange={(e) => setForm({ ...form, salePrice: e.target.value })} required />
                        <button className="btn-primario" disabled={buscandoOFF}>{editando ? 'Guardar' : '+ Agregar'}</button>
                        {editando && (
                            <button type="button" className="btn-outline" onClick={() => { setEditando(null); setForm({ code: '', barcode: '', name: '', category: '', salePrice: '', imageUrl: '' }); }}>
                                Cancelar
                            </button>
                        )}
                    </div>
                    {buscandoOFF && <span style={{ fontSize: '0.85rem', color: '#888' }}>Buscando en OpenFoodFacts...</span>}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        {form.imageUrl && <img src={form.imageUrl} alt="preview" referrerPolicy="no-referrer" style={{ height: 40, width: 40, objectFit: 'cover', borderRadius: 4 }} />}
                        <input placeholder="URL de Imagen (Opcional)" value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} style={{ flex: 1, maxWidth: 300 }} />
                    </div>
                </div>
            </form>

            <table className="admin-table">
                <thead>
                    <tr>
                        <th>Imagen</th><th>Código</th><th>Barras</th><th>Nombre</th><th>Categoría</th>
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
                            <td>
                                {a.imageUrl ? <img src={a.imageUrl} alt={a.name} referrerPolicy="no-referrer" style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 4 }} onError={(e) => { e.target.style.display = 'none'; }} /> : <div style={{ width: 40, height: 40, background: '#eee', borderRadius: 4 }} />}
                            </td>
                            <td className="mono">{a.code}</td>
                            <td className="mono">{a.barcode || '—'}</td>
                            <td><strong>{a.name}</strong></td>
                            <td>{a.category || '—'}</td>
                            <td className="der">{fmt(a.salePrice)}</td>
                            {branchId && (
                                <td className="der">
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'flex-end' }}>
                                        <input
                                            type="number"
                                            min="0"
                                            style={{ width: 65, padding: '4px 6px', textAlign: 'right', border: '1px solid var(--border)', borderRadius: 4 }}
                                            value={editingStock[a._id] !== undefined ? editingStock[a._id] : (a.stock ?? '')}
                                            onChange={(e) => setEditingStock(prev => ({ ...prev, [a._id]: e.target.value }))}
                                            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); actualizarStock(a._id); } }}
                                        />
                                        {editingStock[a._id] !== undefined && String(editingStock[a._id]) !== String(a.stock) && (
                                            <button className="btn-mini" onClick={() => actualizarStock(a._id)} title="Guardar stock">✓</button>
                                        )}
                                    </div>
                                </td>
                            )}
                            {branchId && <td className="der">{fmt(a.avgCost)}</td>}
                            <td className="der">
                                <button className="btn-mini" onClick={() => { setEditando(a._id); setForm({ code: a.code, barcode: a.barcode || '', name: a.name, category: a.category || '', salePrice: a.salePrice, imageUrl: a.imageUrl || '' }); }}>Editar</button>
                                <button className="btn-mini rojo" onClick={() => darDeBaja(a)}>Baja</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};
