import { useState, useCallback, useMemo } from 'react';
import { fmt } from '../lib/format';
import { useArticulos } from '../hooks/useArticulos';
import { updateArticulo } from '../api/article.api';
import { Button } from '../components/ui/Button';

// ── Artículos: catálogo + stock + gestión de categorías ────────────────
export const ArticulosPage = () => {
    const [branchId, setBranchId] = useState('');
    const { articulos, sucursales, crear, editar, darDeBaja, actualizarStock } = useArticulos(branchId);

    const [form, setForm] = useState({ code: '', barcode: '', name: '', category: '', salePrice: '', imageUrl: '' });
    const [editando, setEditando] = useState(null);
    const [buscandoOFF, setBuscandoOFF] = useState(false);
    const [editingStock, setEditingStock] = useState({});
    const [showCatModal, setShowCatModal] = useState(false);
    const [filtroCategoria, setFiltroCategoria] = useState('');
    const [busqueda, setBusqueda] = useState('');

    const categorias = useMemo(() => {
        const set = new Set();
        articulos.forEach((a) => { if (a.category) set.add(a.category); });
        return [...set].sort((a, b) => a.localeCompare(b, 'es'));
    }, [articulos]);

    const articulosFiltrados = useMemo(() => {
        let list = articulos;
        if (filtroCategoria) list = list.filter((a) => a.category === filtroCategoria);
        if (busqueda.trim()) {
            const q = busqueda.toLowerCase();
            list = list.filter((a) =>
                a.name?.toLowerCase().includes(q) || a.code?.toLowerCase().includes(q) || a.barcode?.toLowerCase().includes(q)
            );
        }
        return list;
    }, [articulos, filtroCategoria, busqueda]);

    const buscarEnOFF = async (barcode) => {
        if (!barcode || barcode.length < 8) return;
        setBuscandoOFF(true);
        try {
            const res = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);
            const data = await res.json();
            if (data.status === 1 && data.product) {
                const p = data.product;
                setForm((prev) => ({
                    ...prev,
                    name: prev.name || p.product_name_es || p.product_name || '',
                    category: prev.category || (p.categories ? p.categories.split(',')[0].trim() : ''),
                    imageUrl: prev.imageUrl || p.image_url || p.image_front_url || ''
                }));
            }
        } catch (err) { console.error('Error fetching from OFF:', err); }
        finally { setBuscandoOFF(false); }
    };

    const guardar = async (e) => {
        e.preventDefault();
        try {
            const payload = { ...form, salePrice: Number(form.salePrice) };
            if (editando) await editar(editando, payload);
            else await crear(payload);
            setForm({ code: '', barcode: '', name: '', category: '', salePrice: '', imageUrl: '' });
            setEditando(null);
        } catch (err) { alert(err.response?.data?.message || 'Error al guardar el artículo'); }
    };

    const confirmarBaja = async (a) => {
        if (!window.confirm(`¿Dar de baja "${a.name}"?`)) return;
        await darDeBaja(a._id);
    };

    const guardarStock = async (articleId) => {
        const qty = editingStock[articleId];
        if (qty === undefined || qty === '') return;
        try {
            await actualizarStock(articleId, Number(qty));
            setEditingStock((prev) => { const n = { ...prev }; delete n[articleId]; return n; });
        } catch (err) { alert(err.response?.data?.message || 'Error al actualizar stock'); }
    };

    const cancelar = () => {
        setEditando(null);
        setForm({ code: '', barcode: '', name: '', category: '', salePrice: '', imageUrl: '' });
    };

    const imgUrl = (a) => a.imageUrl || a.image_url || a.image || '';

    return (
        <div className="art-page">
            {/* ── Toolbar ─────────────────────────────────────────────── */}
            <div className="art-toolbar">
                <h2>Artículos</h2>
                <div className="art-toolbar-actions">
                    <div className="art-search-box">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                        <input placeholder="Buscar artículo…" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
                    </div>
                    <select value={filtroCategoria} onChange={(e) => setFiltroCategoria(e.target.value)} className="art-select">
                        <option value="">Todas las categorías</option>
                        {categorias.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <select value={branchId} onChange={(e) => setBranchId(e.target.value)} className="art-select">
                        <option value="">Stock de… (sucursal)</option>
                        {sucursales.map((b) => <option key={b._id} value={b._id}>{b.name}</option>)}
                    </select>
                    <button className="btn-categorias" type="button" onClick={() => setShowCatModal(true)}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
                        Categorías
                    </button>
                </div>
            </div>

            {/* ── Formulario ──────────────────────────────────────────── */}
            <form className="art-form glass-panel" onSubmit={guardar}>
                <div className="art-form-grid">
                    <input placeholder="Código *" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} required />
                    <input placeholder="Cód. barras" value={form.barcode} onChange={(e) => setForm({ ...form, barcode: e.target.value })} onBlur={(e) => buscarEnOFF(e.target.value)} />
                    <input placeholder="Nombre *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="art-input-wide" />
                    <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                        <option value="">Sin categoría</option>
                        {categorias.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <input placeholder="Precio *" type="number" step="0.01" min="0" value={form.salePrice} onChange={(e) => setForm({ ...form, salePrice: e.target.value })} required />
                </div>
                <div className="art-form-actions">
                    {buscandoOFF && <span className="art-off-status">Buscando en OpenFoodFacts…</span>}
                    <Button disabled={buscandoOFF}>{editando ? '💾 Guardar' : '+ Agregar'}</Button>
                    {editando && <Button variant="outline" type="button" onClick={cancelar}>Cancelar</Button>}
                </div>
            </form>

            {/* ── Tabla ───────────────────────────────────────────────── */}
            <div className="art-table-wrap glass-panel">
                <table className="art-table">
                    <thead>
                        <tr>
                            <th>Código</th><th>Barras</th><th>Nombre</th><th>Categoría</th>
                            <th className="der">Precio</th>
                            {branchId && <th className="der">Stock</th>}
                            {branchId && <th className="der">Costo prom.</th>}
                            <th className="der">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {articulosFiltrados.length === 0 && (
                            <tr><td colSpan={branchId ? 8 : 6} className="muted centro">
                                {articulos.length === 0 ? 'Catálogo vacío.' : 'Sin resultados para el filtro.'}
                            </td></tr>
                        )}
                        {articulosFiltrados.map((a) => (
                            <tr key={a._id}>
                                <td className="mono">{a.code}</td>
                                <td className="mono">{a.barcode || '—'}</td>
                                <td><strong>{a.name}</strong></td>
                                <td>{a.category ? <span className="art-badge-cat">{a.category}</span> : <span className="muted">—</span>}</td>
                                <td className="der">{fmt(a.salePrice)}</td>
                                {branchId && (
                                    <td className="der">
                                        <div className="art-stock-cell">
                                            <input
                                                type="number" min="0" className="art-stock-input"
                                                value={editingStock[a._id] !== undefined ? editingStock[a._id] : (a.stock ?? '')}
                                                onChange={(e) => setEditingStock((prev) => ({ ...prev, [a._id]: e.target.value }))}
                                                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); guardarStock(a._id); } }}
                                            />
                                            {editingStock[a._id] !== undefined && String(editingStock[a._id]) !== String(a.stock) && (
                                                <button className="btn-mini" onClick={() => guardarStock(a._id)} title="Guardar stock">✓</button>
                                            )}
                                        </div>
                                    </td>
                                )}
                                {branchId && <td className="der">{fmt(a.avgCost)}</td>}
                                <td className="der art-actions-cell">
                                    <button className="btn-mini" onClick={() => { setEditando(a._id); setForm({ code: a.code, barcode: a.barcode || '', name: a.name, category: a.category || '', salePrice: a.salePrice, imageUrl: imgUrl(a) }); }}>Editar</button>
                                    <Button variant="destructive" onClick={() => confirmarBaja(a)}>Baja</Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div className="art-table-footer">
                    <span className="muted">{articulosFiltrados.length} artículo{articulosFiltrados.length !== 1 ? 's' : ''}</span>
                </div>
            </div>

            {/* ── Modal Categorías ──────────────────────────────────── */}
            {showCatModal && (
                <CategoriasModal
                    articulos={articulos}
                    categorias={categorias}
                    onClose={() => setShowCatModal(false)}
                    onCategoryRenamed={(oldName, newName) => {
                        Promise.all(
                            articulos.filter((a) => a.category === oldName).map((a) =>
                                updateArticulo(a._id, { ...a, category: newName })
                            )
                        );
                    }}
                    onArticleCategoryChanged={(articleId, newCategory) => {
                        const art = articulos.find((a) => a._id === articleId);
                        if (art) updateArticulo(articleId, { ...art, category: newCategory });
                    }}
                />
            )}
        </div>
    );
};

// ── Modal de categorías (sin cambios funcionales) ─────────────────────────
function CategoriasModal({ articulos, categorias, onClose, onCategoryRenamed, onArticleCategoryChanged }) {
    const [expandida, setExpandida] = useState(null);
    const [editandoCat, setEditandoCat] = useState(null);
    const [nuevoNombre, setNuevoNombre] = useState('');
    const [nuevaCat, setNuevaCat] = useState('');
    const [creando, setCreando] = useState(false);

    const articulosDeCat = (cat) => articulos.filter((a) => a.category === cat);
    const sinCategoria = articulos.filter((a) => !a.category);

    const iniciarEdicion = (cat) => { setEditandoCat(cat); setNuevoNombre(cat); };

    const guardarEdicion = () => {
        if (!nuevoNombre.trim() || nuevoNombre.trim() === editandoCat) { setEditandoCat(null); return; }
        onCategoryRenamed(editandoCat, nuevoNombre.trim());
        setEditandoCat(null);
    };

    const crearCategoria = () => {
        if (!nuevaCat.trim()) return;
        setNuevaCat('');
        setCreando(false);
        alert(`La categoría "${nuevaCat.trim()}" se creará al asignarla a un artículo.`);
    };

    return (
        <div className="cat-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
            <div className="cat-modal glass-panel">
                <div className="cat-modal-header">
                    <h3>Gestionar Categorías</h3>
                    <button className="cat-close-btn" onClick={onClose}>✕</button>
                </div>
                <div className="cat-modal-body">
                    <div className="cat-new-section">
                        {creando ? (
                            <div className="cat-new-form">
                                <input autoFocus placeholder="Nombre de la categoría" value={nuevaCat} onChange={(e) => setNuevaCat(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') crearCategoria(); if (e.key === 'Escape') setCreando(false); }} />
                                <Button size="sm" onClick={crearCategoria}>Crear</Button>
                                <Button variant="outline" size="sm" onClick={() => setCreando(false)}>Cancelar</Button>
                            </div>
                        ) : (
                            <Button size="sm" onClick={() => setCreando(true)}>+ Nueva categoría</Button>
                        )}
                    </div>
                    <div className="cat-list">
                        {categorias.length === 0 && <p className="muted" style={{ textAlign: 'center', padding: 20 }}>No hay categorías aún.</p>}
                        {categorias.map((cat) => {
                            const arts = articulosDeCat(cat);
                            const isExpanded = expandida === cat;
                            return (
                                <div key={cat} className={`cat-item ${isExpanded ? 'expanded' : ''}`}>
                                    <div className="cat-item-header" onClick={() => setExpandida(isExpanded ? null : cat)}>
                                        <div className="cat-item-left">
                                            <svg className={`cat-chevron ${isExpanded ? 'open' : ''}`} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                                            {editandoCat === cat ? (
                                                <input autoFocus className="cat-edit-input" value={nuevoNombre} onChange={(e) => setNuevoNombre(e.target.value)} onBlur={guardarEdicion} onKeyDown={(e) => { if (e.key === 'Enter') guardarEdicion(); if (e.key === 'Escape') setEditandoCat(null); }} onClick={(e) => e.stopPropagation()} />
                                            ) : (
                                                <span className="cat-name">{cat}</span>
                                            )}
                                        </div>
                                        <div className="cat-item-right">
                                            <span className="cat-count">{arts.length} art.</span>
                                            <button className="btn-mini" onClick={(e) => { e.stopPropagation(); iniciarEdicion(cat); }} title="Renombrar">✏️</button>
                                        </div>
                                    </div>
                                    {isExpanded && (
                                        <div className="cat-products">
                                            {arts.length === 0 ? <p className="muted" style={{ padding: '8px 0' }}>Sin artículos.</p> : (
                                                <ul className="cat-product-list">
                                                    {arts.map((a) => (
                                                        <li key={a._id}>
                                                            <span className="cat-prod-name">{a.name}</span>
                                                            <span className="cat-prod-price">{fmt(a.salePrice)}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                        {sinCategoria.length > 0 && (
                            <div className={`cat-item sin-cat ${expandida === '__sin__' ? 'expanded' : ''}`}>
                                <div className="cat-item-header" onClick={() => setExpandida(expandida === '__sin__' ? null : '__sin__')}>
                                    <div className="cat-item-left">
                                        <svg className={`cat-chevron ${expandida === '__sin__' ? 'open' : ''}`} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                                        <span className="cat-name muted">Sin categoría</span>
                                    </div>
                                    <span className="cat-count">{sinCategoria.length} art.</span>
                                </div>
                                {expandida === '__sin__' && (
                                    <div className="cat-products">
                                        <ul className="cat-product-list">
                                            {sinCategoria.map((a) => (
                                                <li key={a._id}><span className="cat-prod-name">{a.name}</span><span className="cat-prod-price">{fmt(a.salePrice)}</span></li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
