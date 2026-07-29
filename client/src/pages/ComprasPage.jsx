import { useState } from 'react';
import { fmt } from '../lib/format';
import { useCompras } from '../hooks/useCompras';
import { Button } from '../components/ui/Button';

const METODOS = ['efectivo', 'transferencia', 'mercadopago', 'tarjeta'];

// Módulo Compras: entrada de mercadería. Suma stock a la sucursal destino y
// recalcula el costo promedio (acá se "manejan los precios de compra").
export const ComprasPage = () => {
    const { compras, articulos, sucursales, proveedores, loading, registrarCompra, crearProveedor } = useCompras();

    const [cab, setCab] = useState({ branchId: '', supplierId: '', paymentMethod: 'transferencia', notes: '' });
    const [items, setItems] = useState([]);
    const [temp, setTemp] = useState({ articleId: '', quantity: '', unitCost: '' });
    const [ocupado, setOcupado] = useState(false);

    // Alta rápida de proveedor sin salir de la carga de la compra
    const [nuevoProv, setNuevoProv] = useState(null); // null = cerrado

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

    if (loading && !compras.length) return <div className="muted">Cargando compras…</div>;

    return (
        <div>
            <h2>Compras</h2>

            <div className="admin-panel">
                <h3>Nueva compra</h3>
                <div className="admin-form-row">
                    <select value={cab.branchId} onChange={(e) => setCab({ ...cab, branchId: e.target.value })}>
                        <option value="">Sucursal destino *</option>
                        {sucursales.map((b) => <option key={b._id} value={b._id}>{b.name}</option>)}
                    </select>
                    <select value={cab.supplierId} onChange={(e) => {
                        if (e.target.value === '__nuevo__') {
                            setNuevoProv({ name: '', phone: '', cuit: '' });
                        } else {
                            setCab({ ...cab, supplierId: e.target.value });
                        }
                    }}>
                        <option value="">Proveedor…</option>
                        {proveedores.map((p) => <option key={p._id} value={p._id}>{p.name}</option>)}
                        <option value="__nuevo__">+ Nuevo proveedor</option>
                    </select>
                    <select value={cab.paymentMethod} onChange={(e) => setCab({ ...cab, paymentMethod: e.target.value })}>
                        {METODOS.map((m) => <option key={m} value={m}>{m}</option>)}
                    </select>
                    <input placeholder="Notas (factura, remito…)" value={cab.notes} onChange={(e) => setCab({ ...cab, notes: e.target.value })} />
                </div>

                {nuevoProv && (
                    <div className="admin-form-row">
                        <input placeholder="Nombre del proveedor *" value={nuevoProv.name} onChange={(e) => setNuevoProv({ ...nuevoProv, name: e.target.value })} />
                        <input placeholder="Teléfono" value={nuevoProv.phone} onChange={(e) => setNuevoProv({ ...nuevoProv, phone: e.target.value })} />
                        <input placeholder="CUIT" value={nuevoProv.cuit} onChange={(e) => setNuevoProv({ ...nuevoProv, cuit: e.target.value })} />
                        <Button type="button" onClick={guardarProveedor}>Guardar proveedor</Button>
                        <Button variant="outline" type="button" onClick={() => setNuevoProv(null)}>Cancelar</Button>
                    </div>
                )}

                <div className="admin-form-row">
                    <select value={temp.articleId} onChange={(e) => setTemp({ ...temp, articleId: e.target.value })}>
                        <option value="">Artículo…</option>
                        {articulos.map((a) => <option key={a._id} value={a._id}>{a.code} — {a.name}</option>)}
                    </select>
                    <input placeholder="Cantidad" type="number" min="1" style={{ maxWidth: 110 }} value={temp.quantity} onChange={(e) => setTemp({ ...temp, quantity: e.target.value })} />
                    <input placeholder="Costo unit." type="number" min="0" step="0.01" style={{ maxWidth: 120 }} value={temp.unitCost} onChange={(e) => setTemp({ ...temp, unitCost: e.target.value })} />
                    <Button variant="outline" type="button" onClick={agregarItem}>+ Ítem</Button>
                </div>

                {items.length > 0 && (
                    <>
                        <table className="admin-table compacta">
                            <thead><tr><th>Artículo</th><th className="der">Cant.</th><th className="der">Costo</th><th className="der">Subtotal</th><th></th></tr></thead>
                            <tbody>
                                {items.map((i, idx) => (
                                    <tr key={idx}>
                                        <td>{i.name}</td>
                                        <td className="der">{i.quantity}</td>
                                        <td className="der">{fmt(i.unitCost)}</td>
                                        <td className="der">{fmt(i.quantity * i.unitCost)}</td>
                                        <td className="der"><Button variant="destructive" onClick={() => setItems(items.filter((_, x) => x !== idx))}>✕</Button></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div className="admin-toolbar">
                            <strong>Total: {fmt(total)}</strong>
                            <Button disabled={ocupado} onClick={registrar}>
                                {ocupado ? 'Registrando…' : 'Registrar compra'}
                            </Button>
                        </div>
                    </>
                )}
            </div>

            <h3>Historial</h3>
            <table className="admin-table">
                <thead><tr><th>Fecha</th><th>Proveedor</th><th>Ítems</th><th>Método</th><th className="der">Total</th></tr></thead>
                <tbody>
                    {compras.length === 0 && <tr><td colSpan="5" className="muted centro">Sin compras registradas.</td></tr>}
                    {compras.map((c) => (
                        <tr key={c._id}>
                            <td>{new Date(c.createdAt).toLocaleDateString('es-AR')}</td>
                            <td>{c.supplierName || '—'}</td>
                            <td>{c.items.map((i) => `${i.quantity}× ${i.name}`).join(', ')}</td>
                            <td>{c.paymentMethod}</td>
                            <td className="der"><strong>{fmt(c.total)}</strong></td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};
