import { useState } from 'react';
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
    const { compras, articulos, sucursales, proveedores, loading, registrarCompra, crearProveedor } = useCompras();

    const [cab, setCab] = useState({ branchId: '', supplierId: '', paymentMethod: 'transferencia', notes: '' });
    const [items, setItems] = useState([]);
    const [temp, setTemp] = useState({ articleId: '', quantity: '', unitCost: '' });
    const [ocupado, setOcupado] = useState(false);

    const [nuevoProv, setNuevoProv] = useState(null);

    const total = items.reduce((a, i) => a + i.quantity * i.unitCost, 0);

    const agregarItem = () => {
        const art = articulos.find((a) => a._id === temp.articleId);
        if (!art || !temp.quantity || temp.unitCost === '') return;
        setItems([...items, {
            articleId: art._id, name: art.name,
            quantity: parseInt(temp.quantity, 10),
            unitCost: Number(temp.unitCost)
        }]);
        setTemp({ articleId: '', quantity: '', unitCost: '' });
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
            <h2 className="mt-0 mb-4 text-2xl font-semibold">Compras</h2>

            <Card className="mb-6">
                <h3 className="mt-0 mb-3">Nueva compra</h3>
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

                <div className="mb-2.5 flex flex-wrap gap-2.5">
                    <Select value={temp.articleId} onValueChange={(v) => setTemp({ ...temp, articleId: v })}>
                        <SelectTrigger><SelectValue placeholder="Artículo…" /></SelectTrigger>
                        <SelectContent>
                            {articulos.map((a) => <SelectItem key={a._id} value={a._id}>{a.code} — {a.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <Input placeholder="Cantidad" type="number" min="1" className="max-w-28" value={temp.quantity} onChange={(e) => setTemp({ ...temp, quantity: e.target.value })} />
                    <Input placeholder="Costo unit." type="number" min="0" step="0.01" className="max-w-32" value={temp.unitCost} onChange={(e) => setTemp({ ...temp, unitCost: e.target.value })} />
                    <Button variant="outline" type="button" onClick={agregarItem}>+ Ítem</Button>
                </div>

                {items.length > 0 && (
                    <>
                        <Table compact className="mb-3">
                            <TableHeader>
                                <TableRow><Th>Artículo</Th><Th className="text-right">Cant.</Th><Th className="text-right">Costo</Th><Th className="text-right">Subtotal</Th><Th></Th></TableRow>
                            </TableHeader>
                            <TableBody>
                                {items.map((i, idx) => (
                                    <TableRow key={idx}>
                                        <Td>{i.name}</Td>
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

            <h3 className="mb-2.5">Historial</h3>
            <Card className="overflow-hidden p-0">
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
                                    <Td className="text-right"><strong>{fmt(c.total)}</strong></Td>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </Card>
        </div>
    );
};
