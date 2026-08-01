import { useState, useMemo } from 'react';
import { Search, Tags, Pencil } from 'lucide-react';
import { fmt } from '../../../lib/format';
import { useArticulos } from '../../../hooks/useArticulos';
import { updateArticulo } from '../../../api';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Card } from '../../../components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, Th, Td } from '../../../components/ui/Table';
import { EmptyState } from '../../../components/ui/EmptyState';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../../../components/ui/Select';
import { CategoriasModal } from './components/CategoriasModal';

const TODAS_CATS = '__todas__';
const SIN_CATEGORIA = '__sin_categoria__';

export const ProductosPage = () => {
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
        <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="m-0 text-2xl font-semibold">Productos</h2>
                <div className="flex flex-wrap items-center gap-2.5">
                    <div className="flex min-w-[180px] items-center gap-1.5 rounded-md border border-input bg-card px-3 py-2 text-muted-foreground focus-within:border-primary focus-within:text-foreground">
                        <Search size={15} />
                        <input
                            placeholder="Buscar producto…"
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                            className="w-full border-none bg-transparent text-sm text-foreground outline-none"
                        />
                    </div>
                    <Select value={filtroCategoria || TODAS_CATS} onValueChange={(v) => setFiltroCategoria(v === TODAS_CATS ? '' : v)}>
                        <SelectTrigger><SelectValue placeholder="Todas las categorías" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value={TODAS_CATS}>Todas las categorías</SelectItem>
                            {categorias.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <Select value={branchId || TODAS_CATS} onValueChange={(v) => setBranchId(v === TODAS_CATS ? '' : v)}>
                        <SelectTrigger><SelectValue placeholder="Stock de… (local)" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value={TODAS_CATS}>Stock de… (local)</SelectItem>
                            {sucursales.map((b) => <SelectItem key={b._id} value={b._id}>{b.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <Button type="button" onClick={() => setShowCatModal(true)}>
                        <Tags size={16} />
                        Categorías
                    </Button>
                </div>
            </div>

            <Card>
                <form onSubmit={guardar}>
                    <div className="grid grid-cols-[100px_130px_1fr_140px_110px] gap-2.5 max-[900px]:grid-cols-2 max-[600px]:grid-cols-1">
                        <Input placeholder="Código *" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} required />
                        <Input placeholder="Cód. barras" value={form.barcode} onChange={(e) => setForm({ ...form, barcode: e.target.value })} onBlur={(e) => buscarEnOFF(e.target.value)} />
                        <Input placeholder="Nombre *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                        <Select value={form.category || SIN_CATEGORIA} onValueChange={(v) => setForm({ ...form, category: v === SIN_CATEGORIA ? '' : v })}>
                            <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value={SIN_CATEGORIA}>Sin categoría</SelectItem>
                                {categorias.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <Input placeholder="Precio *" type="number" step="0.01" min="0" value={form.salePrice} onChange={(e) => setForm({ ...form, salePrice: e.target.value })} required />
                    </div>
                    <div className="mt-2.5 flex items-center gap-2.5">
                        {buscandoOFF && <span className="animate-pulse text-sm text-muted-foreground">Buscando en OpenFoodFacts…</span>}
                        <Button disabled={buscandoOFF}>{editando ? '💾 Guardar' : '+ Agregar'}</Button>
                        {editando && <Button variant="outline" type="button" onClick={cancelar}>Cancelar</Button>}
                    </div>
                </form>
            </Card>

            <Card className="overflow-hidden p-0">
                {articulosFiltrados.length === 0 ? (
                    <EmptyState message={articulos.length === 0 ? 'Catálogo vacío.' : 'Sin resultados para el filtro.'} />
                ) : (
                    <Table compact>
                        <TableHeader>
                            <TableRow>
                                <Th>Código</Th><Th>Barras</Th><Th>Nombre</Th><Th>Categoría</Th>
                                <Th className="text-right">Precio</Th>
                                {branchId && <Th className="text-right">Stock</Th>}
                                {branchId && <Th className="text-right">Costo prom.</Th>}
                                <Th className="text-right">Acciones</Th>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {articulosFiltrados.map((a) => (
                                <TableRow key={a._id}>
                                    <Td className="font-mono text-xs">{a.code}</Td>
                                    <Td className="font-mono text-xs">{a.barcode || '—'}</Td>
                                    <Td><strong>{a.name}</strong></Td>
                                    <Td>
                                        {a.category
                                            ? <span className="inline-block rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold whitespace-nowrap text-primary">{a.category}</span>
                                            : <span className="text-muted-foreground">—</span>}
                                    </Td>
                                    <Td className="text-right">{fmt(a.salePrice)}</Td>
                                    {branchId && (
                                        <Td className="text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <Input
                                                    type="number" min="0" className="h-7 w-16 px-1.5 text-right"
                                                    value={editingStock[a._id] !== undefined ? editingStock[a._id] : (a.stock ?? '')}
                                                    onChange={(e) => setEditingStock((prev) => ({ ...prev, [a._id]: e.target.value }))}
                                                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); guardarStock(a._id); } }}
                                                />
                                                {editingStock[a._id] !== undefined && String(editingStock[a._id]) !== String(a.stock) && (
                                                    <Button variant="outline" size="sm" onClick={() => guardarStock(a._id)} title="Guardar stock">✓</Button>
                                                )}
                                            </div>
                                        </Td>
                                    )}
                                    {branchId && <Td className="text-right">{fmt(a.avgCost)}</Td>}
                                    <Td className="text-right whitespace-nowrap">
                                        <div className="flex justify-end gap-1.5">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => { setEditando(a._id); setForm({ code: a.code, barcode: a.barcode || '', name: a.name, category: a.category || '', salePrice: a.salePrice, imageUrl: imgUrl(a) }); }}
                                            >
                                                Editar
                                            </Button>
                                            <Button variant="destructive" size="sm" onClick={() => confirmarBaja(a)}>Baja</Button>
                                        </div>
                                    </Td>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
                <div className="border-t border-border px-4 py-2.5">
                    <span className="text-sm text-muted-foreground">{articulosFiltrados.length} producto{articulosFiltrados.length !== 1 ? 's' : ''}</span>
                </div>
            </Card>

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
