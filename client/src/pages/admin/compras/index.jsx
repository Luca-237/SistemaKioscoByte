import { useState, useRef, useEffect } from 'react';
import { fmt } from '../../../lib/format';
import { useCompras } from '../../../hooks/useCompras';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Card } from '../../../components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, Th, Td } from '../../../components/ui/Table';
import { EmptyState } from '../../../components/ui/EmptyState';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../../../components/ui/Select';

const METODOS = ['efectivo', 'transferencia', 'mercadopago', 'tarjeta'];
const NUEVO_PROVEEDOR = '__nuevo__';

export const ComprasPage = () => {
    const { compras, articulos, sucursales, proveedores, categorias, loading, registrarCompra, crearProveedor, crearArticulo } = useCompras();

    const [cab, setCab] = useState({ branchId: '', supplierId: '', paymentMethod: 'transferencia', notes: '' });
    const [items, setItems] = useState([]);
    const [temp, setTemp] = useState({ articleId: '', quantity: '', unitCost: '', name: '', lote: '', fechaVencimiento: '' });
    const [ocupado, setOcupado] = useState(false);

    const [nuevoProv, setNuevoProv] = useState(null);

    // ── Producto: modo existente / nuevo ──
    const [modoProducto, setModoProducto] = useState(null); // null | 'existente' | 'nuevo'
    const [busqueda, setBusqueda] = useState('');
    const [nuevoArticulo, setNuevoArticulo] = useState({ code: '', name: '', category: '' });
    const [creandoArticulo, setCreandoArticulo] = useState(false);
    const [dropdownAbierto, setDropdownAbierto] = useState(false);
    const dropdownRef = useRef(null);

    // Cerrar dropdown al hacer click fuera
    useEffect(() => {
        const handler = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setDropdownAbierto(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const articulosFiltrados = articulos.filter((a) => {
        if (!busqueda.trim()) return true;
        const q = busqueda.toLowerCase();
        return a.name.toLowerCase().includes(q) || (a.code && a.code.toLowerCase().includes(q));
    });

    const artSeleccionado = articulos.find((a) => a._id === temp.articleId);
    const catArtSeleccionado = artSeleccionado ? categorias.find(c => c.name === artSeleccionado.category) : null;
    const requiereVto = catArtSeleccionado ? catArtSeleccionado.requiereVencimiento : false;

    const seleccionarArticuloExistente = (art) => {
        setTemp({ ...temp, articleId: art._id, name: art.name });
        setBusqueda('');
        setDropdownAbierto(false);
        setModoProducto(null);
    };

    const crearNuevoArticulo = async () => {
        if (!nuevoArticulo.code?.trim()) return alert('El código es obligatorio');
        if (!nuevoArticulo.name?.trim()) return alert('El nombre es obligatorio');
        setCreandoArticulo(true);
        try {
            const art = await crearArticulo({
                code: nuevoArticulo.code.trim(),
                name: nuevoArticulo.name.trim(),
                category: nuevoArticulo.category || '',
                salePrice: 0
            });
            setTemp({ ...temp, articleId: art._id, name: art.name });
            setNuevoArticulo({ code: '', name: '', category: '' });
            setModoProducto(null);
        } catch (err) {
            alert(err.response?.data?.message || 'Error al crear el artículo');
        } finally {
            setCreandoArticulo(false);
        }
    };

    const volverModoProducto = () => {
        setModoProducto(null);
        setBusqueda('');
        setNuevoArticulo({ code: '', name: '', category: '' });
        setDropdownAbierto(false);
    };

    const total = items.reduce((a, i) => a + i.quantity * i.unitCost, 0);

    const agregarItem = () => {
        if (!temp.articleId || !temp.quantity || temp.unitCost === '') return;

        if (requiereVto) {
            if (!temp.lote?.trim() || !temp.fechaVencimiento) {
                return alert('El lote y la fecha de vencimiento son obligatorios para esta categoría.');
            }
        }

        const art = articulos.find((a) => a._id === temp.articleId);
        const itemName = art ? art.name : temp.name;

        setItems([...items, {
            articleId: temp.articleId, 
            name: itemName,
            quantity: parseInt(temp.quantity, 10),
            unitCost: Number(temp.unitCost),
            lote: temp.lote?.trim() || undefined,
            fechaVencimiento: temp.fechaVencimiento || undefined
        }]);
        setTemp({ articleId: '', quantity: '', unitCost: '', name: '', lote: '', fechaVencimiento: '' });
        setModoProducto(null);
    };

    const guardarProveedor = async () => {
        if (!nuevoProv?.name?.trim()) return alert('El nombre del proveedor es obligatorio');
        try {
            const prov = await crearProveedor(nuevoProv);
            setCab((prev) => ({ ...prev, supplierId: prov._id }));
            setNuevoProv(null);
        } catch (err) { alert(err.response?.data?.message || 'Error al crear el proveedor'); }
    };

    const registrar = async () => {
        if (!cab.branchId) return alert('Elegí la sucursal destino');
        if (items.length === 0) return alert('Agregá al menos un artículo');
        setOcupado(true);
        try {
            await registrarCompra({ ...cab, items });
            setItems([]);
            setCab({ branchId: '', supplierId: '', paymentMethod: 'transferencia', notes: '' });
            alert('Compra registrada: stock y costos promedio actualizados.');
        } catch (err) { alert(err.response?.data?.message || 'Error al registrar la compra'); }
        finally { setOcupado(false); }
    };

    if (loading && !compras.length) return <div className="text-muted-foreground">Cargando compras…</div>;

    return (
        <div>
            <div className="mb-6">
                <div className="flex items-center gap-2.5">
                    <span className="h-6 w-1.5 rounded-full bg-primary" />
                    <h1 className="m-0 text-2xl font-bold tracking-tight text-foreground">Registro de Compras</h1>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">Ingreso de mercadería, gestión de proveedores y actualización de costos promedio.</p>
            </div>

            <Card className="mb-6">
                <h3 className="m-0 mb-3 text-base font-semibold text-foreground">Nueva compra</h3>
                <div className="mb-2.5 flex flex-wrap gap-2.5">
                    <Select value={cab.branchId} onValueChange={(v) => setCab({ ...cab, branchId: v })}>
                        <SelectTrigger><SelectValue placeholder="Sucursal destino *" /></SelectTrigger>
                        <SelectContent>
                            {sucursales.map((b) => <SelectItem key={b._id} value={b._id}>{b.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <Select
                        value={cab.supplierId}
                        onValueChange={(v) => v === NUEVO_PROVEEDOR ? setNuevoProv({ name: '', phone: '', cuit: '' }) : setCab({ ...cab, supplierId: v })}
                    >
                        <SelectTrigger><SelectValue placeholder="Proveedor…" /></SelectTrigger>
                        <SelectContent>
                            {proveedores.map((p) => <SelectItem key={p._id} value={p._id}>{p.name}</SelectItem>)}
                            <SelectItem value={NUEVO_PROVEEDOR}>+ Nuevo proveedor</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select value={cab.paymentMethod} onValueChange={(v) => setCab({ ...cab, paymentMethod: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            {METODOS.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <Input placeholder="Notas (factura, remito…)" value={cab.notes} onChange={(e) => setCab({ ...cab, notes: e.target.value })} className="max-w-56" />
                </div>

                {nuevoProv && (
                    <div className="mb-2.5 flex flex-wrap gap-2.5">
                        <Input placeholder="Nombre del proveedor *" value={nuevoProv.name} onChange={(e) => setNuevoProv({ ...nuevoProv, name: e.target.value })} className="max-w-56" />
                        <Input placeholder="Teléfono" value={nuevoProv.phone} onChange={(e) => setNuevoProv({ ...nuevoProv, phone: e.target.value })} className="max-w-44" />
                        <Input placeholder="CUIT" value={nuevoProv.cuit} onChange={(e) => setNuevoProv({ ...nuevoProv, cuit: e.target.value })} className="max-w-44" />
                        <Button type="button" onClick={guardarProveedor}>Guardar proveedor</Button>
                        <Button variant="outline" type="button" onClick={() => setNuevoProv(null)}>Cancelar</Button>
                    </div>
                )}

                {/* ── Selector de producto ── */}
                <div className="mb-2.5">
                    {/* Producto ya seleccionado */}
                    {temp.articleId && modoProducto === null && (
                        <div className="mb-2.5 flex flex-wrap items-center gap-2.5">
                            <span className="rounded-md border border-input bg-muted/50 px-3 py-2 text-sm">
                                📦 {artSeleccionado ? `${artSeleccionado.code} — ${artSeleccionado.name}` : 'Artículo seleccionado'}
                            </span>
                            <Button variant="outline" size="sm" type="button" onClick={() => setTemp({ ...temp, articleId: '' })}>Cambiar</Button>
                        </div>
                    )}

                    {/* Paso 1: elegir modo */}
                    {!temp.articleId && modoProducto === null && (
                        <div className="flex flex-wrap gap-2.5">
                            <Button variant="outline" type="button" onClick={() => setModoProducto('existente')}>
                                📋 Producto existente
                            </Button>
                            <Button variant="outline" type="button" onClick={() => setModoProducto('nuevo')}>
                                ➕ Nuevo producto
                            </Button>
                        </div>
                    )}

                    {/* Modo existente: búsqueda + lista */}
                    {modoProducto === 'existente' && (
                        <div className="flex flex-col gap-2">
                            <div className="flex flex-wrap items-center gap-2.5">
                                <div className="relative" ref={dropdownRef} style={{ minWidth: '260px' }}>
                                    <Input
                                        placeholder="Buscar por nombre o código…"
                                        value={busqueda}
                                        onChange={(e) => {
                                            setBusqueda(e.target.value);
                                            setDropdownAbierto(true);
                                        }}
                                        onFocus={() => setDropdownAbierto(true)}
                                        className="w-full"
                                    />
                                    {dropdownAbierto && (
                                        <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-48 overflow-y-auto rounded-md border bg-popover shadow-md">
                                            {articulosFiltrados.length === 0 ? (
                                                <div className="px-3 py-2 text-sm text-muted-foreground">Sin resultados</div>
                                            ) : (
                                                articulosFiltrados.map((a) => (
                                                    <button
                                                        key={a._id}
                                                        type="button"
                                                        className="flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground"
                                                        onClick={() => seleccionarArticuloExistente(a)}
                                                    >
                                                        <span className="font-mono text-xs text-muted-foreground">{a.code}</span>
                                                        <span>{a.name}</span>
                                                    </button>
                                                ))
                                            )}
                                        </div>
                                    )}
                                </div>
                                <Button variant="outline" size="sm" type="button" onClick={volverModoProducto}>← Volver</Button>
                            </div>
                        </div>
                    )}

                    {/* Modo nuevo: formulario inline */}
                    {modoProducto === 'nuevo' && (
                        <div className="flex flex-col gap-2.5">
                            <div className="flex flex-wrap items-center gap-2.5">
                                <Input
                                    placeholder="Código *"
                                    value={nuevoArticulo.code}
                                    onChange={(e) => setNuevoArticulo({ ...nuevoArticulo, code: e.target.value })}
                                    className="max-w-36"
                                />
                                <Input
                                    placeholder="Nombre *"
                                    value={nuevoArticulo.name}
                                    onChange={(e) => setNuevoArticulo({ ...nuevoArticulo, name: e.target.value })}
                                    className="max-w-56"
                                />
                                <Select
                                    value={nuevoArticulo.category}
                                    onValueChange={(v) => setNuevoArticulo({ ...nuevoArticulo, category: v })}
                                >
                                    <SelectTrigger><SelectValue placeholder="Categoría…" /></SelectTrigger>
                                    <SelectContent>
                                        {categorias.filter((c) => c.active !== false).map((c) => (
                                            <SelectItem key={c._id} value={c.name}>{c.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Button type="button" disabled={creandoArticulo} onClick={crearNuevoArticulo}>
                                    {creandoArticulo ? 'Creando…' : 'Crear y agregar'}
                                </Button>
                                <Button variant="outline" size="sm" type="button" onClick={volverModoProducto}>← Volver</Button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Cantidad y costo (siempre visible cuando hay artículo seleccionado) */}
                {temp.articleId && (
                    <div className="mb-2.5 flex flex-wrap gap-2.5">
                        <Input placeholder="Cantidad" type="number" min="1" className="max-w-28" value={temp.quantity} onChange={(e) => setTemp({ ...temp, quantity: e.target.value })} />
                        <Input placeholder="Costo unit." type="number" min="0" step="0.01" className="max-w-32" value={temp.unitCost} onChange={(e) => setTemp({ ...temp, unitCost: e.target.value })} />
                        <Input placeholder={requiereVto ? "Lote *" : "Lote"} className="max-w-32" value={temp.lote || ''} onChange={(e) => setTemp({ ...temp, lote: e.target.value })} />
                        <div className="relative">
                            <span className="absolute -top-3 left-2 bg-card px-1 text-[10px] text-muted-foreground">{requiereVto ? "Vencimiento *" : "Vencimiento"}</span>
                            <Input type="date" className="max-w-40 pt-1" value={temp.fechaVencimiento || ''} onChange={(e) => setTemp({ ...temp, fechaVencimiento: e.target.value })} />
                        </div>
                        <Button variant="outline" type="button" onClick={agregarItem}>+ Ítem</Button>
                    </div>
                )}

                {items.length > 0 && (
                    <>
                        <Table compact className="mb-3">
                            <TableHeader>
                                <TableRow>
                                    <Th>Artículo</Th>
                                    <Th>Lote/Vto</Th>
                                    <Th className="text-right">Cant.</Th>
                                    <Th className="text-right">Costo</Th>
                                    <Th className="text-right">Subtotal</Th>
                                    <Th></Th>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {items.map((i, idx) => (
                                    <TableRow key={idx}>
                                        <Td>{i.name}</Td>
                                        <Td className="text-xs text-muted-foreground">
                                            {i.lote || i.fechaVencimiento ? (
                                                <>L: {i.lote || '-'} | V: {i.fechaVencimiento ? new Date(i.fechaVencimiento).toLocaleDateString('es-AR', { timeZone: 'UTC' }) : '-'}</>
                                            ) : '-'}
                                        </Td>
                                        <Td className="text-right">{i.quantity}</Td>
                                        <Td className="text-right">{fmt(i.unitCost)}</Td>
                                        <Td className="text-right">{fmt(i.quantity * i.unitCost)}</Td>
                                        <Td className="text-right"><Button variant="destructive" size="sm" onClick={() => setItems(items.filter((_, x) => x !== idx))}>✕</Button></Td>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <strong>Total: {fmt(total)}</strong>
                            <Button disabled={ocupado} onClick={registrar}>
                                {ocupado ? 'Registrando…' : 'Registrar compra'}
                            </Button>
                        </div>
                    </>
                )}
            </Card>

            <h3 className="m-0 mb-3 text-base font-semibold text-foreground">Historial</h3>
            <Card className="overflow-hidden p-0 gap-0">
                {compras.length === 0 ? (
                    <EmptyState message="Sin compras registradas." />
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow><Th>Fecha</Th><Th>Proveedor</Th><Th>Ítems</Th><Th>Método</Th><Th className="text-right">Total</Th></TableRow>
                        </TableHeader>
                        <TableBody>
                            {compras.map((c) => (
                                <TableRow key={c._id}>
                                    <Td>{new Date(c.createdAt).toLocaleDateString('es-AR')}</Td>
                                    <Td>{c.supplierName || '—'}</Td>
                                    <Td>{c.items.map((i) => `${i.quantity}× ${i.name}`).join(', ')}</Td>
                                    <Td>{c.paymentMethod}</Td>
                                    <Td className="text-right">{fmt(c.total)}</Td>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </Card>
        </div>
    );
};
